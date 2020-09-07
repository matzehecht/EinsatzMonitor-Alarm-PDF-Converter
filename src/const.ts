import * as fs from 'fs';
import * as path from 'path';
const { version } = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

namespace CONST {
  // Make log dir
  if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
  export const LOG_PATH = `${path.resolve('./logs')}/${new Date().toISOString().replace(/^(.*)T.*/, '$1')}.log`;

  export const INTERNAL_ERROR = `An internal error occured!
Please check the log file for more information!
Path: ${LOG_PATH}`;

  export const HELP_MESSAGE = `VERSION ${version || 'dev system'}
Extractor tool of EMAPC (EinsatzMonitor-Alarm-PDF-Converter).
MIT Licensed.
Written by Matthias Hecht (https://github.com/matzehecht).
Source available: https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter

Documentation: https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/README.md

This tool extracts the relevant information of the alarm pdf into a key-value formated file.

USAGE: extractor [--config configFilePath] inputFile outFileOrDir

MANDATORY ARGUMENTS:
    inputFile           This has to be the path to a valid PDF file. (The alarm pdf file)
    outFileOrDir        This can be the path to a (not-existing) output file. 
                            In this case the script will use the provided file name.
                            - OR -
                        This can be the path to a existing directory.
                            In this case the script will auto generate the file name.

OPTIONAL ARGUMENTS:
    --config            This parameter should be followed by a valid path the a custom config file.
                        If not provided the script will use the default config.`;
}

export default CONST;
