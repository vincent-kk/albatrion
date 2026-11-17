import * as fs from 'node:fs';

/** File content, or null when the file does not exist. */
export function readIfExists(filePath: string): string | null {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : null;
}
