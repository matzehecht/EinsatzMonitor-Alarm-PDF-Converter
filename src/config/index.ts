import { createValidator } from '@typeonly/validator';
import * as YAML from 'yamljs';
import * as utils from '../utils';
import { Config, Section } from './config';
export { Config, Section };

export function load(configPath: string = './default.conf.yml'): Config {
  const config = YAML.load(configPath);

  const validator = createValidator({
    bundle: require('./config-types.to.json')
  });

  const result = validator.validate('Config', config);

  if (!result.valid) {
    throw new Error(result.error);
  } else {
    utils.logInfo('CONFIG', 'validated config successfully!');
  }

  return config;
}
