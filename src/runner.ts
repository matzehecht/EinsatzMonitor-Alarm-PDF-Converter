import * as fs from 'fs';
import * as path from 'path';
import { convert } from '.';
import { load as loadConfig } from './config';
import * as utils from './utils';

const CONFIG_FILE = path.resolve('./emapc.conf.yml');

const config = loadConfig(CONFIG_FILE);

if (!config.runner) utils.throwErr(new Error('CONFIG - runner config missing!'));

run();

fs.watch(config.runner?.inputDir as string, run);

async function run() {
  await convert(config.runner?.inputDir as string, true, config.runner?.outputDir as string, config);
  if (config.runner?.archiveDir) {
    const files = await fs.promises.readdir(config.runner?.inputDir as string, { withFileTypes: true });
    const pdfFiles = files.filter(f => f.isFile() && path.extname(f.name) === '.pdf');
    pdfFiles.forEach(pdf => fs.promises.rename(path.resolve(config.runner?.inputDir as string, pdf.name), path.resolve(config.runner?.archiveDir as string, pdf.name)));
  }
}
