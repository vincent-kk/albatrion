import { mkdir } from 'node:fs/promises';

/** Creates a fresh output directory and refuses an existing one. */
export async function createOutput(path: string): Promise<void> {
  await mkdir(path);
}
