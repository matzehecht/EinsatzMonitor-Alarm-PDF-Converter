import * as fs from 'fs';
import * as os from 'os';
import * as child from 'child_process';
import * as Config from './config';
import * as path from 'path';
import * as Extractor from './extractor';
import * as utils from './utils';

export function convert(inputFileOrDir: string, isInputDir: boolean, outputFileOrDir: string, configFile?: string) {
  const config = Config.load(configFile);

  if (!isInputDir) {
    const fnWithoutExt = path.basename(inputFileOrDir, '.pdf');
    const outputFile = path.extname(outputFileOrDir) === '' ? path.join(outputFileOrDir, `${fnWithoutExt}.txt`) : outputFileOrDir;

    if (path.extname(inputFileOrDir) !== '.pdf') {
      utils.logInfo('INPUT', `skipping the file ${path.resolve(inputFileOrDir)} as it is not a pdf file!`);
    } else {
      utils.logInfo('INPUT', `processing ${path.resolve(inputFileOrDir)}!`);

      run(config, inputFileOrDir, outputFile);
    }
  } else {
    const files = fs.readdirSync(inputFileOrDir, { withFileTypes: true });

    files.forEach((file) => {
      const filename = file.name;
      const fnWithoutExt = path.basename(filename, path.extname(filename));

      if (path.extname(filename) !== '.pdf') {
        utils.logInfo('INPUT', `skipping the file ${path.resolve(filename)} as it is not a pdf file!`);
        return;
      } else {
        utils.logInfo('INPUT', `processing ${path.resolve(filename)}!`);

        run(config, path.join(inputFileOrDir, filename), path.join(outputFileOrDir, `${fnWithoutExt}.txt`));
      }
    });
  }
}

function toWriteString(text: string) {
  return `${text}${os.EOL}`;
}

function joinSafe(array: string[], separator?: string): string {
  return array.map((cur: string) => (!separator ? cur : cur.replace(RegExp(separator, 'gi'), separator === ';' ? ',' : ';'))).join(separator);
}

function run(config: Config.Config, inputFile: string, outputFile: string) {
  const pdftotext = getBinary();
  const pdftotextCMD = `${pdftotext} -simple ${inputFile} -`;
  utils.logInfo('Read pdf', 'command: ' + pdftotextCMD);
  const raw = child.execSync(pdftotextCMD, { encoding: 'latin1' });

  const output = Extractor.extract(raw, config);

  const writer = fs.createWriteStream(outputFile);

  Object.entries(output).forEach(([k, v]) => {
    writer.write(toWriteString('-'.repeat(k.length + 6)));
    writer.write(toWriteString(`|  ${k}  |`));
    writer.write(toWriteString('-'.repeat(k.length + 6)));
    writer.write(toWriteString(''));

    if (Array.isArray(v)) {
      const columnSeparator = config?.output?.table?.columnSeparator || ';';

      writer.write(toWriteString(`columns=${joinSafe(Object.keys(v[0]), columnSeparator)}`));

      const printRowHeaders = config.output?.table?.printRowHeaders;
      if (printRowHeaders !== undefined && printRowHeaders === true)
        writer.write(
          toWriteString(
            `${Object.keys(v[0])[0] || 'rows'}=${joinSafe(
              v.map((r) => Object.values(r)[0]),
              columnSeparator
            )}`
          )
        );

      v.forEach((l) => {
        const [lFirst, ...lRemaining] = Object.values(l);

        writer.write(toWriteString(`${lFirst}=${joinSafe(lRemaining, columnSeparator)}`));
      });
    } else {
      Object.entries(v).forEach(([ik, iv]) => {
        writer.write(toWriteString(`${ik}=${iv}`));
      });
    }

    writer.write(toWriteString(''));
  });

  writer.close();
}

function getBinary() {
  let script = 'pdftotext';
  let pathToScript = '';

  switch (os.arch()) {
    case 'x64':
      script = script + '64';
      break;
    case 'x32':
      script = script + '32';
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

  return path.resolve(`./lib/pdftotext/${pathToScript}/${script}`);
}
