import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function expandGlob(
  pattern: string,
  rootDir: string,
): Promise<string[]> {
  const parts = pattern.split('/');
  let current = [rootDir];
  for (const part of parts) {
    const next: string[] = [];
    for (const dir of current) {
      if (part === '*') {
        const entries = await readdir(dir, { withFileTypes: true }).catch(
          () => [],
        );
        for (const entry of entries) {
          if (entry.isDirectory()) next.push(join(dir, entry.name));
        }
      } else if (part === '**') {
        const queue = [dir];
        while (queue.length > 0) {
          const d = queue.shift();
          if (!d) break;
          const entries = await readdir(d, { withFileTypes: true }).catch(
            () => [],
          );
          for (const entry of entries) {
            if (entry.isDirectory()) {
              const sub = join(d, entry.name);
              next.push(sub);
              queue.push(sub);
            }
          }
        }
      } else {
        next.push(join(dir, part));
      }
    }
    current = next;
  }
  return current;
}
