import { lstat } from 'node:fs/promises';

import { hashFile } from '../hash/index.js';

/**
 * Hash an installed regular file without accepting an alias at its basename.
 * @param path Absolute destination already validated for its scope.
 * @returns Content hash, or null when no regular file occupies that path.
 */
export async function hashInstalledFile(path: string): Promise<string | null> {
  try {
    if ((await lstat(path)).isFile()) return hashFile(path);
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT'))
      throw error;
  }
  return null;
}
