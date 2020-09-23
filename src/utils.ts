import { appendFile, appendFileSync } from 'fs';
import * as path from 'path';

import * as CONST from './const';

export function logInfo(...msg: string[]) {
  appendFile(
    CONST.LOG_PATH,
    `[${new Date().toISOString()}] INFO ${msg.join(' - ')}
`,
    () => {
      /** */
    }
  );
}

export function throwErr(err: Error, internal: boolean = false) {
  if (internal) {
    console.log(CONST.INTERNAL_ERROR);
  } else {
    console.log(err.message, '\n', `Log path: ${CONST.LOG_PATH}`);
  }
  appendFileSync(
    CONST.LOG_PATH,
    `[${new Date().toISOString()}] ERROR ${err.name} - ${err.message}
${err.stack || ''}
`
  );
  process.exit(1);
}

export function unixPathFrom(oldPath: string) {
  return oldPath.split(path.sep).join(path.posix.sep).slice(oldPath.indexOf(':') + 1);
}
