import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import * as path from 'path';
import * as YAML from 'js-yaml';
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
let oldFileSize: number;

/**
 * Checks if fileSize changed more than 60%. (> 0.6 results in false)
 *
 * @param {number} size
 * @param {number} [oldSize]
 * @returns {boolean}
 */
const isValidRead = (size: number, oldSize?: number): boolean => {
  if (oldSize && oldSize !== 0) {
    const diff = Math.abs(size / oldSize - 1);
    return diff < 0.6;
  }
  return true;
};

export function get(): Observable<Config> {
  return config.asObservable();
}

export async function load(configPath: string): Promise<void> {
  let buffer = await fs.readFile(configPath);

  while (!isValidRead(buffer.byteLength, oldFileSize)) {
    buffer = await fs.readFile(configPath);
  }

  oldFileSize = buffer.byteLength;

  const content = buffer.toString('utf8');
  const loadedConfig = YAML.load(content) as Config;

  const ajv = new Ajv();
  const validate = ajv.compile(require('./schema.json'));

  if (!validate(loadedConfig)) {
    console.error(`[${new Date().toISOString()}] CONFIG ERROR - ${ajv.errorsText(validate.errors)}`);
    config.next();
  } else {
    utils.logInfo('CONFIG', 'validated config successfully!');

    if (loadedConfig.service?.inputDir && (!existsSync(loadedConfig.service.inputDir) || !(await fs.stat(loadedConfig.service.inputDir)).isDirectory())) {
      console.error(`[${new Date().toISOString()}] CONFIG ERROR - input dir does not exist`);
      config.next();
      return;
    }

    if (loadedConfig.service) {
      loadedConfig.service.inputDir = path.resolve(loadedConfig.service.inputDir);
      loadedConfig.service.outputDir = path.resolve(loadedConfig.service.outputDir);
      loadedConfig.service.archiveDir = loadedConfig.service.archiveDir && path.resolve(loadedConfig.service.archiveDir);
    }

    config.next(loadedConfig);
  }
}
