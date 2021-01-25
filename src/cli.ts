#!/usr/bin/env node
import * as CONST from './const';
import * as fs from 'fs';
import * as path from 'path';
import * as utils from './utils';
import { convert } from '.';
import { load as loadConfig } from './config';

run();

async function run() {
  
  const { configFile, inputFileOrDir, isInputDir, outputFileOrDir } = parseArgs(process.argv);
  
  const config = await loadConfig(configFile);
  
  if (config) {
    await convert(inputFileOrDir, isInputDir, outputFileOrDir, config.input, config.output);
  } else {
    process.exit(1);
  }
}

function parseArgs(argv: string[]) {
  if (argv.find((a) => ['--help', '-help', 'help', '--h', '-h', 'h', '--?', '-?', '?'].includes(a))) {
    console.log(CONST.HELP_MESSAGE);
    process.exit(0);
  }
  const args = argv.slice(2);

  // get config
  const configIndex = args.findIndex((a) => ['--config', '-c'].includes(a));
  if (configIndex === -1) throwErr(new Error('CONFIG - no config provided'));
  const configFile = args[configIndex + 1];

  // remove '--config' and the following filepath from the array
  if (configIndex > -1) args.splice(configIndex, 2);

  utils.logInfo(!configFile ? 'Using standard config' : `using config file ${configFile}`);

  const inputFileOrDir = args[0];
  if (!inputFileOrDir) throwErr(new Error('No input given!'));
  utils.logInfo('INPUT', 'path ' + inputFileOrDir);
  const outputArg = args[1];
  if (!outputArg) throwErr(new Error('No output path given!'));

  let outputFileOrDir = '';

  // check args
  if (configFile && !fs.existsSync(configFile)) throwErr(new Error('config file does not exist'));
  if (!fs.existsSync(inputFileOrDir)) throwErr(new Error('input file does not exist'));

  const isInputDir = fs.statSync(inputFileOrDir).isDirectory();

  try {
    if (path.extname(outputArg) === '') {
      if (!fs.existsSync(outputArg)) {
        throwErr(new Error('output dir does not exist'));
      }

      outputFileOrDir = path.resolve(outputArg);
      utils.logInfo('OUTPUT', `Using input file name`);
    } else {
      if (!fs.existsSync(path.dirname(outputArg))) {
        throwErr(new Error('output dir does not exist'));
      }

      if (isInputDir) throwErr(new Error('output cannot be a file if input is a directory!'));
      outputFileOrDir = outputArg;
      utils.logInfo('OUTPUT', `Using given file name ${outputFileOrDir}`);
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
