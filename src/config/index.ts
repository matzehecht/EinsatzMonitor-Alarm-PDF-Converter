import { createValidator } from '@typeonly/validator';
import { existsSync, statSync } from 'fs';
import * as YAML from 'yamljs';
import * as utils from '../utils';
import { Config, Runner, Input, SectionType, Section, Output, Key, BaseKey, KeyValueKey, TableKey, ListByWordKey, ValueByWordKey, ValueIndexKey } from './config';
export { Config, Runner, Input, SectionType, Section, Output, Key, BaseKey, KeyValueKey, TableKey, ListByWordKey, ValueByWordKey, ValueIndexKey };

export function load(configPath: string): Config {
  const config = YAML.load(configPath) as Config;

  const validator = createValidator({
    bundle: require('./config-types.to.json')
  });

  const result = validator.validate('Config', config);

  if (!result.valid) {
    utils.throwErr(new Error('VALIDATION: ' + result.error));
  } else {
    utils.logInfo('CONFIG', 'validated config successfully!');
  }

  if (config.runner?.inputDir && ( !existsSync(config.runner.inputDir) || !statSync(config.runner.inputDir).isDirectory() )) utils.throwErr(new Error('input dir does not exist'));
  if (config.runner?.outputDir && ( !existsSync(config.runner.outputDir) || !statSync(config.runner.outputDir).isDirectory() )) utils.throwErr(new Error('output dir does not exist'));
  if (config.runner?.archiveDir && ( !existsSync(config.runner.archiveDir) || !statSync(config.runner.archiveDir).isDirectory() )) utils.throwErr(new Error('archive dir does not exist'));

  return config;
}
