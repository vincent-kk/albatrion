import { mkdir } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { setTimeout } from 'node:timers/promises';

/**
 * Claim the record's filesystem lock across processes before reading for an update.
 * @param path Absolute record path. Parent directory aliases reach the same lock.
 * @returns The claimed directory for the caller to remove after the update.
 * @throws For filesystem failures or when the lock remains claimed for ten seconds.
 */
export async function lockInstalledAssetRecord(path: string): Promise<string> {
  const parent = dirname(path);
  const lock = join(parent, `.agents-assets-sync-${basename(path)}.lock`);
  await mkdir(parent, { recursive: true });
  const deadline = performance.now() + 10_000;
  for (;;) {
    try {
      await mkdir(lock);
      return lock;
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST'))
        throw error;
      if (performance.now() >= deadline)
        throw new Error(`Timed out waiting for installed asset record lock: ${lock}`);
      await setTimeout(25);
    }
  }
}
