import * as chokidar from 'chokidar';
import { Stats, promises as fsPromises } from 'fs';
import * as path from 'path';
import * as TraceIt from 'trace-it';
import { LowDbAdapter } from '@trace-it/lowdb-adapter';

import { convert } from '.';
import { load as loadConfig } from './config';
import * as utils from './utils';

const shouldTrace = Boolean(process.env.SHOULD_TRACE) || false;

const adapter = shouldTrace ? new LowDbAdapter({ dbName: './tmp/perf.json' }) : undefined;
if (shouldTrace) TraceIt.init(adapter as LowDbAdapter);

const CONFIG_FILE = path.resolve('./emapc.conf.yml');

const configTransaction = shouldTrace ? TraceIt.startTransaction('loadConfig') : undefined;
configTransaction?.set('path', CONFIG_FILE);
const config = loadConfig(CONFIG_FILE);
configTransaction?.set('config', config);
configTransaction?.end();

if (!config.runner) utils.throwErr(new Error('CONFIG - runner config missing!'));

const watcher = chokidar.watch(`${utils.unixPathFrom(config.runner!.inputDir)}/*.pdf`, {
  followSymlinks: false,
  depth: 0
});

watcher.on('add', run);

async function run(filepath: string, stat?: Stats) {
  const fileChangeTransaction = shouldTrace ? TraceIt.startTransaction('file change detected') : undefined;
  fileChangeTransaction?.set('filepath', filepath);
  await convert(filepath, false, config.runner?.outputDir as string, config, fileChangeTransaction);

  if (config.runner?.archiveDir) {
    const archiveTransaction = fileChangeTransaction?.startChild('archive');
    await fsPromises.rename(path.resolve(filepath), path.resolve(config.runner?.archiveDir as string, path.basename(filepath)));
    archiveTransaction?.end();
  }
  fileChangeTransaction?.end();
}
