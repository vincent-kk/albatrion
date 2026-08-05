import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function* walkFiles(root: string): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw err;
  }
  for (const entry of entries) {
    const abs = join(root, entry.name);
    if (entry.isDirectory()) yield* walkFiles(abs);
    else if (entry.isFile()) yield abs;
  }
}
