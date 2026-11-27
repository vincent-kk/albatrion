import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {(callerUrl: string) => (dir: string) => void} */
export const createClearDir = (callerUrl) => (dir) => {

  if (!dir) throw new Error('Directory name is required');

  if (typeof dir !== 'string')
    throw new Error('Directory name must be a string');

  const __dirname = dirname(fileURLToPath(callerUrl));
  const dirPath = join(__dirname, dir);

  try {
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      if (!stats.isDirectory()) {
        console.warn(
          `⚠️  ${dir} exists but is not a directory, skipping cleanup`,
        );
        return;
      }

      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`🧹 Clean slate: ${dir} directory cleared`);
    } else {
      console.log(`📁 Directory ${dir} does not exist, skipping cleanup`);
    }
  } catch (error) {
    console.error(`❌ Failed to clear directory ${dir}:`, error.message);
    throw new Error(`Directory cleanup failed: ${error.message}`);
  }
};
