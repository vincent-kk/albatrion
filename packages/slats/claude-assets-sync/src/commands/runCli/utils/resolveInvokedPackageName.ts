import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function resolveInvokedPackageName(
  fileUrl: string,
): Promise<string | null> {
  let current: string;
  try {
    current = dirname(fileURLToPath(fileUrl));
  } catch {
    return null;
  }
  while (true) {
    try {
      const raw = await readFile(join(current, 'package.json'), 'utf-8');
      const pkg = JSON.parse(raw) as { name?: string };
      if (typeof pkg.name === 'string' && pkg.name.length > 0) return pkg.name;
    } catch {
      /* not at this level; keep walking up */
    }
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}
