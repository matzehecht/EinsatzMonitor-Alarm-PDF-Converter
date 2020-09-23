import * as chokidar from 'chokidar';
import { Stats, promises as fsPromises } from 'fs';
import * as path from 'path';
import * as TraceIt from 'trace-it';

import { convert } from '.';
import { load as loadConfig } from './config';
import * as utils from './utils';

TraceIt.init({ storage: 'lowdb', storageOptions: { dbName: './tmp/perf.json' } });

const CONFIG_FILE = path.resolve('./emapc.conf.yml');

const configTransaction = TraceIt.startTransaction('loadConfig');
configTransaction.set('path', CONFIG_FILE);
const config = loadConfig(CONFIG_FILE);
configTransaction.set('config', config);
configTransaction.end();

if (!config.runner) utils.throwErr(new Error('CONFIG - runner config missing!'));

const watcher = chokidar.watch(`${utils.unixPathFrom(config.runner!.inputDir)}/*.pdf`, {
  followSymlinks: false,
  depth: 0
});

watcher.on('add', run);

async function run(filepath: string, stat?: Stats) {
  const fileChangeTransaction = TraceIt.startTransaction('file change detected');
  fileChangeTransaction.set('filepath', filepath);
  await convert(filepath, false, config.runner?.outputDir as string, config, fileChangeTransaction);
  console.log('run -> config.runner?.archiveDir', config.runner?.archiveDir);
  if (config.runner?.archiveDir) {
    const archiveTransaction = fileChangeTransaction.startChild('archive');
    await fsPromises.rename(path.resolve(filepath), path.resolve(config.runner?.archiveDir as string, path.basename(filepath)));
    archiveTransaction.end();
  }
  fileChangeTransaction.end();
}
