#!/usr/bin/env node
import { utils } from "./utils";
import * as fs from 'fs';
import * as path from 'path';
import CONST from "./const";
import { convert } from ".";

const { configFile, inputFileOrDir, isInputDir, outputFileOrDir } = parseArgs(process.argv);

convert(inputFileOrDir, isInputDir, outputFileOrDir, configFile);

function parseArgs(argv: string[]) {
  if (argv.find((a) => ['--help', '-help', 'help', '--h', '-h', 'h', '--?', '-?', '?'].includes(a))) {
    console.log(CONST.HELP_MESSAGE);
    process.exit(0);
  }
  const args = argv.slice(2);

  // get optional config
  const configIndex = args.findIndex((a) => ['--config', '-c'].includes(a));
  const configFile = configIndex > -1 ? args[configIndex + 1] : undefined;

  // remove '--config' and the following filepath from the array
  if (configIndex > -1) args.splice(configIndex, 2);

  utils.logInfo(!configFile ? 'Using standard config' : `using config file ${configFile}`);

  const inputFileOrDir = args[0];
  if (!inputFileOrDir) utils.throwErr(new Error('No input given!'));
  utils.logInfo('INPUT', 'path ' + inputFileOrDir);
  const outputArg = args[1];
  if (!outputArg) utils.throwErr(new Error('No output path given!'));

  let outputFileOrDir = '';

  // check args
  if (configFile && !fs.existsSync(configFile)) utils.throwErr(new Error('config file does not exist'));
  if (!fs.existsSync(inputFileOrDir)) utils.throwErr(new Error('input file does not exist'));

  const isInputDir = fs.statSync(inputFileOrDir).isDirectory();

  try {
    if (path.extname(outputArg) === '') {
      if (!fs.existsSync(outputArg)) {
        utils.throwErr(new Error('output dir does not exist'));
      }

      outputFileOrDir = !isInputDir ? `${path.resolve(outputArg)}/${path.basename(inputFileOrDir)}` : path.resolve(outputArg);
      utils.logInfo('OUTPUT', `Using generated file name ${outputFileOrDir}`);
    } else {
      if (!fs.existsSync(path.dirname(outputArg))) {
        utils.throwErr(new Error('output dir does not exist'));
      }

      if (isInputDir) utils.throwErr(new Error('output cannot be a file if input is a directory!'));
      outputFileOrDir = outputArg;
      utils.logInfo('OUTPUT', `Using given file name ${outputFileOrDir}`);
    }
  } catch (err) {
    utils.throwErr(err, true);
  }
  return {
    configFile,
    inputFileOrDir,
    isInputDir,
    outputFileOrDir
  };
}