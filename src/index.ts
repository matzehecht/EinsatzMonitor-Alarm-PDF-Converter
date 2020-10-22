import * as TraceIt from 'trace-it';
import * as fs from 'fs';
import * as os from 'os';
import { promisify } from 'util';
import * as child from 'child_process';
import { Config, Key } from './config';
import * as path from 'path';
import * as Extractor from './extractor';
import * as utils from './utils';
import { KeyValueKey, ListByWordKey, ValueByWordKey, ValueIndexKey } from './config';

export function convert(inputFileOrDir: string, isInputDir: boolean, outputFileOrDir: string, config: Config, parentTransaction?: TraceIt.Transaction) {
  const transaction = parentTransaction?.startChild('convert');

  if (!isInputDir) {
    const fileChild = transaction?.startChild('file');
    const fnWithoutExt = path.basename(inputFileOrDir, '.pdf');
    const outputFile = path.extname(outputFileOrDir) === '' ? path.join(outputFileOrDir, `${fnWithoutExt}.txt`) : outputFileOrDir;

    if (path.extname(inputFileOrDir) !== '.pdf') {
      utils.logInfo('INPUT', `skipping the file ${path.resolve(inputFileOrDir)} as it is not a pdf file!`);
    } else {
      utils.logInfo('INPUT', `processing ${path.resolve(inputFileOrDir)}!`);

      run(config, inputFileOrDir, outputFile, fileChild).catch(err => utils.throwErr(err));
    }
    fileChild?.end();
  } else {
    const files = fs.readdirSync(inputFileOrDir, { withFileTypes: true });

    files.forEach((file) => {
      const fileChild = transaction?.startChild('file');
      const filename = file.name;
      const fnWithoutExt = path.basename(filename, path.extname(filename));

      if (path.extname(filename) !== '.pdf') {
        utils.logInfo('INPUT', `skipping the file ${path.resolve(filename)} as it is not a pdf file!`);
      } else {
        utils.logInfo('INPUT', `processing ${path.resolve(filename)}!`);

        run(config, path.join(inputFileOrDir, filename), path.join(outputFileOrDir, `${fnWithoutExt}.txt`), fileChild).catch(err => utils.throwErr(err));
      }
      fileChild?.end();
    });
  }

  transaction?.end();
}

function toWriteString(text: string) {
  return `${text}${os.EOL}`;
}

function joinSafe(array: string[], separator?: string): string {
  return array.map((cur: string) => (!separator ? cur : cur.replace(RegExp(separator, 'gi'), separator === ';' ? ',' : ';'))).join(separator);
}

async function run(config: Config, inputFile: string, outputFile: string, transaction?: TraceIt.Transaction) {
  const pdftotext = getBinary();
  const pdftotextArgs = ['-simple', inputFile, '-'];
  utils.logInfo('Read pdf', `command: ${pdftotext}, args: ${pdftotextArgs}`);
  const readChild = transaction?.startChild('read');
  const raw = (await promisify(child.execFile)(pdftotext, pdftotextArgs, { encoding: 'latin1' })).stdout;
  readChild?.end();

  const extractChild = transaction?.startChild('extract');
  const output = Extractor.extract(raw, config, extractChild);
  extractChild?.end();

  const writeChild = transaction?.startChild('write');
  const writer = fs.createWriteStream(outputFile);

  const separator = config.output.separator || ';';
  const keyValueSeparator = config.output.keyValueSeparator || ': ';
  const outputKeys = config.output.keys;

  Object.entries(outputKeys).every(([key, keyConfig]: [string, Key]) => {
    if (!output[keyConfig.inputSection]) {
      utils.throwErr(new Error(`OUTPUT - section ${keyConfig.inputSection} not configured in input`));
      return false;
    }

    const sectionValues = output[keyConfig.inputSection];

    if (Array.isArray(sectionValues)) {
      // is table section
      if ('type' in keyConfig) {
        // is ListByWordKey
        const thisKeyConfig = keyConfig as ListByWordKey;

        if (thisKeyConfig.type === 'column') {
          const values = sectionValues
            .map((row) => row[thisKeyConfig.inputKeyWord])
            .filter((value) => {
              return !thisKeyConfig.filter || !value.match(RegExp(thisKeyConfig.filter));
            });

          writer.write(toWriteString(`${key}${keyValueSeparator}${joinSafe(values, separator)}`));
          return true;
        } else {
          const row = sectionValues.find((row) => Object.values(row)[0] === thisKeyConfig.inputKeyWord);
          const values = row ? Object.values(row) : undefined;
          const curatedValues = values?.slice(1).filter((value) => !thisKeyConfig.filter || !value.match(RegExp(thisKeyConfig.filter))) || [];

          writer.write(toWriteString(`${key}${keyValueSeparator}${joinSafe(curatedValues, separator)}`));
          return true;
        }
      } else if ('index' in keyConfig) {
        // is ValueByWordKey
        const thisKeyConfig = keyConfig as ValueByWordKey;
        const rows = sectionValues.filter((row) => thisKeyConfig.inputKeyWords.includes(Object.values(row)[0]));
        const values = rows
          .map((row) => Object.values(row)[thisKeyConfig.index + 1])
          .filter((value) => !thisKeyConfig.filter || !value.match(RegExp(thisKeyConfig.filter)));

        writer.write(toWriteString(`${key}${keyValueSeparator}${values.join(' ')}`));
        return true;
      } else if ('rowIndex' in keyConfig) {
        // is ValueIndexKey
        const thisKeyConfig = keyConfig as ValueIndexKey;

        const row = sectionValues[thisKeyConfig.rowIndex];
        const value = Object.values(row)[thisKeyConfig.columnIndex].trim();

        if (thisKeyConfig.filter && value.match(RegExp(thisKeyConfig.filter))) {
          writer.write(toWriteString(`${key}${keyValueSeparator}`));
          return true;
        } else {
          writer.write(toWriteString(`${key}${keyValueSeparator}${value}`));
          return true;
        }
      } else {
        utils.throwErr(new Error(`OUTPUT - key ${key} should be configured as Table Key`));
        return false;
      }
    } else if (Object.keys(sectionValues).length !== 0) {
      // is keyValue section
      if (!('inputKeyWords' in keyConfig)) {
        utils.throwErr(new Error(`OUTPUT - key ${key} should has inputKeyWords as it is a key value key`));
        return false;
      }
      const thisKeyConfig = keyConfig as KeyValueKey;

      const value = thisKeyConfig.inputKeyWords
        .reduce((prev, key) => {
          const thisValue = sectionValues[key];
          if (!thisValue) return prev;
          if (thisKeyConfig.filter && thisValue.match(RegExp(thisKeyConfig.filter))) return prev;
          return [prev, thisValue].join(' ');
        }, '')
        .trim();

      writer.write(toWriteString(`${key}${keyValueSeparator}${value}`));
      return true;
    } else {
      writer.write(toWriteString(`${key}${keyValueSeparator}`));
      utils.logInfo('OUTPUT', 'empty key', key);
      return true;
    }
  });
  writeChild?.end();

  writer.close();
}

function getBinary() {
  let script = 'pdftotext';
  let pathToScript = '';

  switch (os.arch()) {
    case 'x64':
      script += '64';
      break;
    case 'x32':
      script += '32';
      break;
    default:
      utils.throwErr(new Error(`Architecture ${os.arch()} not supported`));
  }

  switch (os.platform()) {
    case 'darwin':
      pathToScript = 'mac';
      break;
    case 'linux':
      pathToScript = 'linux';
      break;
    case 'win32':
      pathToScript = 'win';
      break;
    default:
      utils.throwErr(new Error(`OS ${os.platform()} not supported`));
  }

  return path.join(path.dirname(process.execPath), `./lib/pdftotext/${pathToScript}/${script}`);
}
