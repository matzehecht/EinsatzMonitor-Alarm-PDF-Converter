import { createValidator } from '@typeonly/validator';
import { existsSync, statSync } from 'fs';
import * as path from 'path';
import * as YAML from 'yamljs';

import * as utils from '../utils';
import {
  Config,
  service,
  Input,
  SectionType,
  Section,
  Output,
  Key,
  BaseKey,
  KeyValueKey,
  TableKey,
  ListByWordKey,
  ValueByWordKey,
  ValueIndexKey
} from './config';

export { Config, service, Input, SectionType, Section, Output, Key, BaseKey, KeyValueKey, TableKey, ListByWordKey, ValueByWordKey, ValueIndexKey };

export function load(configPath: string): Config {
  const config = YAML.load(configPath) as Config;

  const validator = createValidator({
    bundle: require('./config-types.to.json')
  });

  const result = validator.validate('Config', config);

  if (!result.valid) {
    throw new Error('VALIDATION: ' + result.error);
  } else {
    utils.logInfo('CONFIG', 'validated config successfully!');
  }

  if (config.service?.inputDir && (!existsSync(config.service.inputDir) || !statSync(config.service.inputDir).isDirectory()))
    throw new Error('input dir does not exist');
  if (config.service?.outputDir && (!existsSync(config.service.outputDir) || !statSync(config.service.outputDir).isDirectory()))
    throw new Error('output dir does not exist');
  if (config.service?.archiveDir && (!existsSync(config.service.archiveDir) || !statSync(config.service.archiveDir).isDirectory()))
    throw new Error('archive dir does not exist');

  if (config.service) {
    config.service.inputDir = path.resolve(config.service.inputDir);
    config.service.outputDir = path.resolve(config.service.outputDir);
    config.service.archiveDir = config.service.archiveDir && path.resolve(config.service.archiveDir);
  }

  return config;
}
