import * as chokidar from 'chokidar';
import { Stats, promises as fs, existsSync } from 'fs';
import * as path from 'path';

import { convert, OutputError } from '.';
import * as Config from './config';
import * as utils from './utils';

const CONFIG_FILE = path.join(utils.basePath, './emapc.conf.yml');

let watcher: chokidar.FSWatcher | undefined;
let folderWatcher: chokidar.FSWatcher | undefined;

Config.getObservable().subscribe(async (config) => {
  await watcher?.close();
  if (config) {
    const { input, output, service } = config as Config.Config;

    if (!service) return console.error('service not given - ERROR that can not be reached!');

    if (!existsSync(service.inputDir) || !(await fs.stat(service.inputDir)).isDirectory()) {
      await fs.mkdir(service.inputDir);
    }

    folderWatcher = chokidar.watch(path.dirname(service.inputDir), {
      followSymlinks: false,
      depth: 0
    });
    folderWatcher.on('unlinkDir', (path) => {
      if (path === service.inputDir) utils.alert('Eingabe ordner gelöscht!', 'error', true);
    });

    watcher = chokidar.watch(`${utils.unixPathFrom(service.inputDir)}/*.pdf`, {
      followSymlinks: false,
      depth: 0,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    watcher.on('add', processFiles(input, output, service));
  }
});

chokidar
  .watch(CONFIG_FILE, {
    followSymlinks: false,
    depth: 0,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 50
    }
  })
  .on('change', async (path, stats) => {
    load(CONFIG_FILE);
  });

load(CONFIG_FILE);

async function load(file: string) {
  try {
    if (file && !existsSync(file)) {
      return utils.alert('config file does not exist', 'error');
    }
    await Config.load(file, true);
  } catch (e) {
    utils.alert('ERROR while loading config! Will try again after config change is detected!', 'error');
    if (e instanceof Config.ConfigError) {
      utils.alert(e.message, 'warn');
    } else if (e instanceof Error) {
      console.error(e.message);
    }
  }
}

const processFiles = (inputConfig: Config.Input, outputConfig: Config.Output, serviceConfig: Config.Service) => async (filepath: string, stat?: Stats) => {
  try {
    await convert(filepath, false, serviceConfig.outputDir as string, inputConfig, outputConfig);
  } catch (err) {
    if (err instanceof OutputError) {
      utils.alert(err.message, 'warn');
    } else if (err instanceof Error) {
      // ? Maybe add telemetry here?
      console.error(err.name, err.message);
    }
  }

  await archive(filepath, serviceConfig.archiveDir);
};

const archive = async (filepath: string, archiveDir?: string) => {
  if (archiveDir) {
    if (!existsSync(archiveDir) || !(await fs.stat(archiveDir)).isDirectory()) {
      await fs.mkdir(archiveDir);
    }

    await fs.rename(path.resolve(filepath), path.resolve(archiveDir, path.basename(filepath)));
  }
};
