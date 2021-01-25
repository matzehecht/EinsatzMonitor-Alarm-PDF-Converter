import * as path from 'path';
import * as child from 'child_process';

const isBinary = typeof (process as any).__nexe !== 'undefined';
export const basePath = isBinary ? path.dirname(process.execPath) : path.resolve(__dirname, '..');

export function logInfo(...msg: string[]) {
  console.log(`[${new Date().toISOString()}] INFO ${msg.join(' - ')}`);
}

export function unixPathFrom(oldPath: string) {
  return oldPath.split(path.sep).join(path.posix.sep);
}

export function alert(message: string, severity: 'info' | 'warn' | 'error', showWindowsUI: boolean = false) {
  console.log(`[${new Date().toISOString()}] ${severity.toUpperCase()} ${message}`);
  if (process.platform === 'win32' && showWindowsUI) {
    child.exec(
      `PowerShell -Command "Add-Type -AssemblyName PresentationFramework;[System.Windows.MessageBox]::Show('${message.replace('\n', '\\n')}','EinsatzMonitor Alarm PDF Converter','Ok','${
        severity === 'info' ? 'Information' : severity === 'warn' ? 'Warning' : 'Error'
      }')"`
    );
  }
}
