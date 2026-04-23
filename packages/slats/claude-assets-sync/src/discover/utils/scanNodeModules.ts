import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { ConsumerPackage } from '../type.js';
import { readJsonOpt } from './readJsonOpt.js';
import { tryAdd } from './tryAdd.js';

export async function scanNodeModules(
  found: Map<string, ConsumerPackage>,
  nodeModules: string,
): Promise<void> {
  let entries;
  try {
    entries = await readdir(nodeModules, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const abs = join(nodeModules, entry.name);
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('@')) {
      let subEntries;
      try {
        subEntries = await readdir(abs, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const subEntry of subEntries) {
        if (!subEntry.isDirectory()) continue;
        const pkgPath = join(abs, subEntry.name);
        const pkg = await readJsonOpt(join(pkgPath, 'package.json'));
        if (pkg) await tryAdd(found, pkgPath, pkg);
      }
    } else {
      const pkg = await readJsonOpt(join(abs, 'package.json'));
      if (pkg) await tryAdd(found, abs, pkg);
    }
  }
}
