import * as fs from 'fs';
import * as os from 'os';
import * as child from 'child_process';
import * as Config from './config';
import * as path from 'path';
import CONST from './const';
import * as Extractor from './extractor';

const { configFile, inputFileOrDir, isInputDir, outputFileOrDir } = parseArgs(process.argv);

const config = Config.load(configFile);

const pdftotext = getBinary();

if (!isInputDir) {
  const fnWithoutExt = path.basename(inputFileOrDir, '.pdf');
  const outputFile = path.extname(outputFileOrDir) === '' ? path.join(outputFileOrDir, `${fnWithoutExt}.txt`) : outputFileOrDir;
  
  if (path.extname(inputFileOrDir) !== '.pdf') {
    logInfo('INPUT', `skipping the file ${path.resolve(inputFileOrDir)} as it is not a pdf file!`);
  } else {
    logInfo('INPUT', `processing ${path.resolve(inputFileOrDir)}!`);
    
    run(config, inputFileOrDir, outputFile);
  }
} else {
  const files = fs.readdirSync(inputFileOrDir, { withFileTypes: true });
  
  files.forEach((file) => {
    const filename = file.name;
    const fnWithoutExt = path.basename(filename, path.extname(filename));
    
    if (path.extname(filename) !== '.pdf') {
      logInfo('INPUT', `skipping the file ${path.resolve(filename)} as it is not a pdf file!`);
      return;
    } else {
      logInfo('INPUT', `processing ${path.resolve(filename)}!`);
      
      run(config, path.join(inputFileOrDir, filename), path.join(outputFileOrDir, `${fnWithoutExt}.txt`));
    }
  });
}

function toWriteString(text: string) {
  return `${text}${os.EOL}`;
}

function run(config: Config.Config, inputFile: string, outputFile: string) {
  const pdftotextCMD = `${pdftotext} -simple ${inputFile} -`;
  logInfo('Read pdf', 'command: ' + pdftotextCMD);
  const raw = child.execSync(pdftotextCMD, { encoding: 'latin1' });

  const output = Extractor.extract(raw, config);

  const writer = fs.createWriteStream(outputFile);

  Object.entries(output).forEach(([k, v]) => {
    writer.write(toWriteString('-'.repeat(k.length + 6)));
    writer.write(toWriteString(`|  ${k}  |`));
    writer.write(toWriteString('-'.repeat(k.length + 6)));
    writer.write(toWriteString(''));
    
    if (Array.isArray(v)) {

      const [first, ...remaining] = Object.keys(v[0]);

      writer.write(toWriteString(`${first}=${remaining.join(';')}`));

      v.forEach((l) => {
        
        const [lFirst, ...lRemaining] = Object.values(l);

        writer.write(toWriteString(`${lFirst}=${lRemaining.join(';')}`));
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

function parseArgs(argv: string[]) {
  if (argv.find((a) => ['--help', '-help', 'help', '--h', '-h', 'h', '--?', '-?', '?'].includes(a))) {
    console.log(CONST.HELP_MESSAGE);
    process.exit(0);
  }
  const args = argv.slice(2);

  // get optional config
  const configIndex = args.findIndex((a) => ['--config', '-c'].includes(a));
  const configFile = configIndex > -1 ? args[configIndex + 1] : './emapc.conf.json';

  // remove '--config' and the following filepath from the array
  if (configIndex > -1) args.splice(configIndex, 2);

  logInfo(configIndex === -1 ? 'Using standard config' : `using config file ${configFile}`);

  const inputFileOrDir = args[0];
  if (!inputFileOrDir) throwErr(new Error('No input given!'));
  logInfo('INPUT', 'path ' + inputFileOrDir);
  const outputArg = args[1];
  if (!outputArg) throwErr(new Error('No output path given!'));

  let outputFileOrDir = '';

  // check args
  if (!fs.existsSync(configFile)) throwErr(new Error('config file does not exist'));
  if (!fs.existsSync(inputFileOrDir)) throwErr(new Error('input file does not exist'));

  const isInputDir = fs.statSync(inputFileOrDir).isDirectory();

  try {
    if (path.extname(outputArg) === '') {
      if (!fs.existsSync(outputArg)) {
        throwErr(new Error('output dir does not exist'))
      }
      
      outputFileOrDir = !isInputDir ? `${path.resolve(outputArg)}/${path.basename(inputFileOrDir)}` : path.resolve(outputArg);
      logInfo('OUTPUT', `Using generated file name ${outputFileOrDir}`);
    } else {
      if (!fs.existsSync(path.dirname(outputArg))) {
        throwErr(new Error('output dir does not exist'))
      }
      
      if (isInputDir) throwErr(new Error('output cannot be a file if input is a directory!'));
      outputFileOrDir = outputArg;
      logInfo('OUTPUT', `Using given file name ${outputFileOrDir}`);
    }
  } catch (err) {
    throwErr(err, true);
  }
  return {
    configFile,
    inputFileOrDir,
    isInputDir,
    outputFileOrDir
  };
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
      throwErr(new Error(`Architecture ${os.arch()} not supported`));
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
      throwErr(new Error(`OS ${os.platform()} not supported`));
  }

  return path.resolve(`./lib/pdftotext/${pathToScript}/${script}`);
}

function logInfo(...msg: string[]) {
  fs.appendFile(
    CONST.LOG_PATH,
    `[${new Date().toISOString()}] INFO ${msg.join(' - ')}
`,
    () => {}
  );
}

function throwErr(err: Error, internal: boolean = false) {
  if (internal) {
    console.log(CONST.INTERNAL_ERROR);
  } else {
    console.log(err.message, '\n', `Log path: ${CONST.LOG_PATH}`);
  }
  fs.appendFileSync(
    CONST.LOG_PATH,
    `[${new Date().toISOString()}] ERROR ${err.name} - ${err.message}
${err.stack || ''}
`
  );
  process.exit(1);
}
