import { join } from 'node:path';

import type { ConsumerPackage } from '../type.js';
import { expandGlob } from './expandGlob.js';
import { readJsonOpt } from './readJsonOpt.js';
import { tryAdd } from './tryAdd.js';

export async function enumerateWorkspaces(
  found: Map<string, ConsumerPackage>,
  rootDir: string,
  patterns: string[],
): Promise<void> {
  for (const pattern of patterns) {
    const matches = await expandGlob(pattern, rootDir);
    for (const packageRoot of matches) {
      const pkg = await readJsonOpt(join(packageRoot, 'package.json'));
      if (pkg) await tryAdd(found, packageRoot, pkg);
    }
  }
}
