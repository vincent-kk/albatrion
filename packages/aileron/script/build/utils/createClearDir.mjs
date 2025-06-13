import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {(callerUrl: string) => (dir: string) => void} */
export const createClearDir = (callerUrl) => (dir) => {
  const __dirname = dirname(fileURLToPath(callerUrl));
  const dirPath = join(__dirname, dir);
  if (dir && fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`🧹 Clean slate: ${dir} directory cleared`);
  }
};
