import { existsSync, statSync } from 'fs';
import * as path from 'path';
import * as YAML from 'yamljs';
import * as Ajv from 'ajv';
import { Observable, Subject } from 'rxjs';

import * as utils from '../utils';
import {
  Config,
  Service,
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

export { Config, Service, Input, SectionType, Section, Output, Key, BaseKey, KeyValueKey, TableKey, ListByWordKey, ValueByWordKey, ValueIndexKey };

const config = new Subject<Config>();
const ajv = new Ajv({
  logger: {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  },
})

export function get(): Observable<Config> {
  return config.asObservable();
}

export function load(configPath: string): void {
  YAML.load(configPath, (loadedConfig: Config) => {
    const validate = ajv.compile(require('./schema.json'));

    if (!validate(loadedConfig)) {
      console.error(`[${new Date().toISOString()}] CONFIG ERROR\n${ajv.errorsText(validate.errors)}`);
      config.next();
    } else {
      utils.logInfo('CONFIG', 'validated config successfully!');

      if (loadedConfig.service?.inputDir && (!existsSync(loadedConfig.service.inputDir) || !statSync(loadedConfig.service.inputDir).isDirectory()))
        throw new Error('input dir does not exist');
      if (loadedConfig.service?.outputDir && (!existsSync(loadedConfig.service.outputDir) || !statSync(loadedConfig.service.outputDir).isDirectory()))
        throw new Error('output dir does not exist');
      if (loadedConfig.service?.archiveDir && (!existsSync(loadedConfig.service.archiveDir) || !statSync(loadedConfig.service.archiveDir).isDirectory()))
        throw new Error('archive dir does not exist');

      if (loadedConfig.service) {
        loadedConfig.service.inputDir = path.resolve(loadedConfig.service.inputDir);
        loadedConfig.service.outputDir = path.resolve(loadedConfig.service.outputDir);
        loadedConfig.service.archiveDir = loadedConfig.service.archiveDir && path.resolve(loadedConfig.service.archiveDir);
      }

      config.next(loadedConfig);
    }
  });
}
