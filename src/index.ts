import * as TraceIt from 'trace-it';
import { createWriteStream, existsSync, promises as fs } from 'fs';
import * as os from 'os';
import { promisify } from 'util';
import * as child from 'child_process';
import { Input, Output, Key } from './config';
import * as path from 'path';
import * as Extractor from './extractor';
import * as utils from './utils';
import { KeyValueKey, ListByWordKey, ValueByWordKey, ValueIndexKey } from './config';

export async function convert(inputFileOrDir: string, isInputDir: boolean, outputFileOrDir: string, inputConfig: Input, outputConfig: Output, parentTransaction?: TraceIt.Transaction) {
  const transaction = parentTransaction?.startChild('convert');

  const proms: Promise<void>[] = [];

  if (!isInputDir) {
    const fileChild = transaction?.startChild('file');
    const fnWithoutExt = path.basename(inputFileOrDir, '.pdf');
    const outputFile = path.extname(outputFileOrDir) === '' ? path.join(outputFileOrDir, `${fnWithoutExt}.txt`) : outputFileOrDir;
    
    if (!existsSync(path.dirname(outputFile)) || !(await fs.stat(path.dirname(outputFile))).isDirectory()) {
      await fs.mkdir(path.dirname(outputFile));
    }

    if (path.extname(inputFileOrDir) !== '.pdf') {
      utils.logInfo('INPUT', `skipping the file ${path.resolve(inputFileOrDir)} as it is not a pdf file!`);
    } else {
      utils.logInfo('INPUT', `processing ${path.resolve(inputFileOrDir)}!`);

      proms.push(run(inputConfig, outputConfig, inputFileOrDir, outputFile, fileChild));
    }
    fileChild?.end();
  } else {
    const files = await fs.readdir(inputFileOrDir, { withFileTypes: true });
    
    if (!existsSync(outputFileOrDir) || !(await fs.stat(outputFileOrDir)).isDirectory()) {
      await fs.mkdir(outputFileOrDir);
    }

    files.every((file) => {
      const fileChild = transaction?.startChild('file');
      const filename = file.name;
      const fnWithoutExt = path.basename(filename, path.extname(filename));

      if (path.extname(filename) !== '.pdf') {
        utils.logInfo('INPUT', `skipping the file ${path.resolve(filename)} as it is not a pdf file!`);
      } else {
        utils.logInfo('INPUT', `processing ${path.resolve(filename)}!`);

        proms.push(run(inputConfig, outputConfig, path.join(inputFileOrDir, filename), path.join(outputFileOrDir, `${fnWithoutExt}.txt`), fileChild));
      }
      fileChild?.end();
      return true;
    });
  }

  transaction?.end();
  return Promise.all(proms);
}

function toWriteString(text: string) {
  return `${text}${os.EOL}`;
}

function joinSafe(array: string[], separator?: string): string {
  return array.map((cur: string) => (!separator ? cur : cur.replace(RegExp(separator, 'gi'), separator === ';' ? ',' : ';'))).join(separator);
}

async function run(inputConfig: Input, outputConfig: Output, inputFile: string, outputFile: string, transaction?: TraceIt.Transaction) {
  const pdftotext = getBinary();
  const pdftotextArgs = ['-simple', inputFile, '-'];
  utils.logInfo('Read pdf', `command: ${pdftotext}, args: ${pdftotextArgs}`);
  const readChild = transaction?.startChild('read');
  const raw = (await promisify(child.execFile)(pdftotext, pdftotextArgs, { encoding: 'latin1' })).stdout;
  readChild?.end();

  try {
    const extractChild = transaction?.startChild('extract');
    const output = Extractor.extract(raw, inputConfig, extractChild);
    extractChild?.end();

    const writeChild = transaction?.startChild('write');
    const writer = createWriteStream(outputFile);

    const separator = outputConfig.separator || ';';
    const keyValueSeparator = outputConfig.keyValueSeparator || ': ';
    const outputKeys = outputConfig.keys;

    Object.entries(outputKeys).every(([key, keyConfig]: [string, Key]) => {
      if (!output[keyConfig.inputSection]) {
        throw new OutputError(`section ${keyConfig.inputSection} not configured in input`);
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

            writer.write(toWriteString(`${key}${keyValueSeparator}${thisKeyConfig.prefix || ''}${joinSafe(values, separator)}${thisKeyConfig.suffix || ''}`));
            return true;
          } else {
            const row = sectionValues.find((row) => Object.values(row)[0] === thisKeyConfig.inputKeyWord);
            const values = row ? Object.values(row) : undefined;
            const curatedValues = values?.slice(1).filter((value) => !thisKeyConfig.filter || !value.match(RegExp(thisKeyConfig.filter))) || [];

            if (keyConfig.required && curatedValues.length === 0) throw new OutputError(`key ${key} is required but empty`);

            writer.write(
              toWriteString(`${key}${keyValueSeparator}${thisKeyConfig.prefix || ''}${joinSafe(curatedValues, separator)}${thisKeyConfig.suffix || ''}`)
            );
            return true;
          }
        } else if ('index' in keyConfig) {
          // is ValueByWordKey
          const thisKeyConfig = keyConfig as ValueByWordKey;
          const rows = sectionValues.filter((row) => thisKeyConfig.inputKeyWords.includes(Object.values(row)[0]));
          const values = rows
            .map((row) => Object.values(row)[thisKeyConfig.index + 1])
            .filter((value) => !thisKeyConfig.filter || !value.match(RegExp(thisKeyConfig.filter)));

          if (keyConfig.required && values.length === 0) throw new OutputError(`key ${key} is required but empty`);

          writer.write(toWriteString(`${key}${keyValueSeparator}${thisKeyConfig.prefix || ''}${values.join(' ')}${thisKeyConfig.suffix || ''}`));
          return true;
        } else if ('rowIndex' in keyConfig) {
          // is ValueIndexKey
          const thisKeyConfig = keyConfig as ValueIndexKey;

          const row = sectionValues[thisKeyConfig.rowIndex];
          const value = Object.values(row)[thisKeyConfig.columnIndex].trim();

          if (keyConfig.required && value.length === 0) throw new OutputError(`key ${key} is required but empty`);

          if (thisKeyConfig.filter && value.match(RegExp(thisKeyConfig.filter))) {
            writer.write(toWriteString(`${key}${keyValueSeparator}`));
            return true;
          } else {
            writer.write(toWriteString(`${key}${keyValueSeparator}${thisKeyConfig.prefix || ''}${value}${thisKeyConfig.suffix || ''}`));
            return true;
          }
        } else {
          throw new OutputError(`key ${key} should be configured as Table Key`);
        }
      } else if (Object.keys(sectionValues).length !== 0) {
        // is keyValue section
        if (!('inputKeyWords' in keyConfig)) {
          throw new OutputError(`key ${key} should has inputKeyWords as it is a key value key`);
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

        if (keyConfig.required && value.length === 0) throw new OutputError(`key ${key} is required but empty`);

        writer.write(toWriteString(`${key}${keyValueSeparator}${thisKeyConfig.prefix || ''}${value}${thisKeyConfig.suffix || ''}`));
        return true;
      } else {
        writer.write(toWriteString(`${key}${keyValueSeparator}`));

        if (keyConfig.required) throw new OutputError(`key ${key} is required but empty`);

        utils.logInfo('OUTPUT', 'empty key', key);
        return true;
      }
    });
    writeChild?.end();

    writer.close();
  } catch (err) {
    const errWriter = createWriteStream(outputFile);
    errWriter.write(raw);
    errWriter.close();
    throw err;
  }
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
      throw new Error(`Architecture ${os.arch()} not supported`);
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
      throw new Error(`OS ${os.platform()} not supported`);
  }

  return path.join(utils.basePath, `./lib/pdftotext/${pathToScript}/${script}`);
}

export class OutputError extends Error {
  constructor(m: string) {
      super('OUTPUT - ' + m);
      Object.setPrototypeOf(this, OutputError.prototype);
  }
}
