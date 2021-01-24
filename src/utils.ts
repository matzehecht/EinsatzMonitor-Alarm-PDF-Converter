import * as path from 'path';

const isBinary = typeof (process as any).__nexe !== 'undefined';
export const basePath = isBinary ? path.dirname(process.execPath) : path.resolve(__dirname, '..');

export function logInfo(...msg: string[]) {
  console.log(`[${new Date().toISOString()}] INFO ${msg.join(' - ')}`);
}

export function unixPathFrom(oldPath: string) {
  return oldPath.split(path.sep).join(path.posix.sep);
}
