import { promises as fs } from 'fs';
import * as path from 'path';
import { parse } from 'yaml';
import Ajv from 'ajv';
import { Observable, ReplaySubject } from 'rxjs';

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

const config = new ReplaySubject<Config>(1);
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

export function getObservable(): Observable<Config> {
  return config.asObservable();
}

export async function load(configPath: string, shouldHaveService?: boolean): Promise<Config> {
  let buffer = await fs.readFile(configPath);

  // Check if the buffer seems like a valid read. If not retry to read the file for max 5 times.
  // On windows the readFile sometimes returned a empty buffer. This issue was fixed with awaitWriteFinish options of chokidar.
  // (chokidar fired before the file was written) I kept that workaround to be sure.
  for (let i = 0; i < 5 && !isValidRead(buffer.byteLength, oldFileSize); i++) {
    buffer = await fs.readFile(configPath);
  }

  // If the retry mechanism did not succeed it should display an error
  if (!isValidRead(buffer.byteLength, oldFileSize)) {
    utils.alert(
      'Beim Einlesen der Konfiguration trat ein Fehler auf, der nicht automatisch behoben werden konnte.\nDieser Fehler kann durch zu große Änderungen an der Konfiguration ausgelöst werden. Versuchen Sie deshalb den Diest neuzustarten. Falls der Fehler weiterhin besteht überprüfen sie Konfigurationsdatei oder erstellen Sie diese neu.',
      'error',
      true
    );
    process.exit(100)
  }

  oldFileSize = buffer.byteLength;

  const content = buffer.toString('utf8');
  const loadedConfig = parse(content) as Config;

  const ajv = new Ajv();
  const validate = ajv.compile(require('./schema.json'));

  if (!validate(loadedConfig)) {
    throw new Error(`[${new Date().toISOString()}] CONFIG ERROR - ${ajv.errorsText(validate.errors)}`);
  } else {
    utils.logInfo('CONFIG', 'validated config successfully!');

    if (shouldHaveService) {
      if (!loadedConfig.service) {
        throw new Error(`[${new Date().toISOString()}] CONFIG ERROR - data should have property 'service'`);
      }
      loadedConfig.service.inputDir = path.resolve(loadedConfig.service.inputDir);
      loadedConfig.service.outputDir = path.resolve(loadedConfig.service.outputDir);
      loadedConfig.service.archiveDir = loadedConfig.service.archiveDir && path.resolve(loadedConfig.service.archiveDir);
    }

    config.next(loadedConfig);
  }

  return loadedConfig;
}
