import { createValidator } from '@typeonly/validator';
import * as YAML from 'yamljs';
import * as utils from '../utils';
import { BaseKey, Config, Input, Key, KeyValueKey, ListByWordKey, Output, Section, SectionType, TableKey, ValueByWordKey, ValueIndexKey } from './config';
export { Config, Input, SectionType, Section, Output, Key, BaseKey, KeyValueKey, TableKey, ListByWordKey, ValueByWordKey, ValueIndexKey };

export function load(configPath: string): Config {
  const config = YAML.load(configPath);

  const validator = createValidator({
    bundle: require('./config-types.to.json')
  });

  const result = validator.validate('Config', config);

  if (!result.valid) {
    utils.throwErr(new Error('VALIDATION: ' + result.error));
  } else {
    utils.logInfo('CONFIG', 'validated config successfully!');
  }

  return config;
}
