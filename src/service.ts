import * as chokidar from 'chokidar';
import { Stats, promises as fsPromises, existsSync } from 'fs';
import * as path from 'path';
import * as TraceIt from 'trace-it';
import { LowDbAdapter } from '@trace-it/lowdb-adapter';

import { convert } from '.';
import { load as loadConfig } from './config';
import * as utils from './utils';

const shouldTrace = Boolean(process.env.SHOULD_TRACE) || false;

const adapter = shouldTrace ? new LowDbAdapter({ dbName: path.join(utils.basePath , './tmp/perf.json') }) : undefined;
if (shouldTrace) TraceIt.init(adapter as LowDbAdapter);

const CONFIG_FILE = path.join(utils.basePath, './emapc.conf.yml');

let config = load(CONFIG_FILE);

if (!config.service) throw new Error('CONFIG - service config missing!');

const watcher = chokidar.watch(`${utils.unixPathFrom(config.service!.inputDir)}/*.pdf`, {
  followSymlinks: false,
  depth: 0
});

watcher.on('add', run);

const configWatcher = chokidar.watch(CONFIG_FILE, {
  followSymlinks: false,
  depth: 0
});

configWatcher.on('change', (path, stats) => {
  config = load(CONFIG_FILE);
});

function load(file: string) {
  const configTransaction = shouldTrace ? TraceIt.startTransaction('loadConfig') : undefined;
  configTransaction?.set('path', file);
  if (file && !existsSync(file)) throw new Error('config file does not exist');
  const config = loadConfig(file);
  configTransaction?.set('config', config);
  configTransaction?.end();
  return config;
}

async function run(filepath: string, stat?: Stats) {
  const fileChangeTransaction = shouldTrace ? TraceIt.startTransaction('file change detected') : undefined;
  fileChangeTransaction?.set('filepath', filepath);

  try {
    await convert(filepath, false, config.service?.outputDir as string, config, fileChangeTransaction);
  } catch (err) {
    await archiveFile(filepath, fileChangeTransaction);
    throw err;
  }

  await archiveFile(filepath, fileChangeTransaction);
  fileChangeTransaction?.end();
}

async function archiveFile(filepath: string, transaction?: TraceIt.Transaction) {
  if (config.service?.archiveDir) {
    const archiveTransaction = transaction?.startChild('archive');
    await fsPromises.rename(path.resolve(filepath), path.resolve(config.service?.archiveDir as string, path.basename(filepath)));
    archiveTransaction?.end();
  }
}
