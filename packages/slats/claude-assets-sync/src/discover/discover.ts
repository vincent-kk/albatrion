import { dirname, join } from 'node:path';

import type { ConsumerPackage, DiscoverOptions } from './type.js';
import { enumerateWorkspaces } from './utils/enumerateWorkspaces.js';
import { readJsonOpt } from './utils/readJsonOpt.js';
import { scanNodeModules } from './utils/scanNodeModules.js';
import { tryAdd } from './utils/tryAdd.js';

export async function discover(
  options: DiscoverOptions = {},
): Promise<ConsumerPackage[]> {
  const cwd = options.cwd ?? process.cwd();
  const includeWorkspaces = options.includeWorkspaces ?? true;

  const found = new Map<string, ConsumerPackage>();

  let current = cwd;
  while (true) {
    const pkg = await readJsonOpt(join(current, 'package.json'));
    if (pkg) {
      await tryAdd(found, current, pkg);
      if (includeWorkspaces && pkg.workspaces) {
        const patterns = Array.isArray(pkg.workspaces)
          ? pkg.workspaces
          : (pkg.workspaces.packages ?? []);
        await enumerateWorkspaces(found, current, patterns);
      }
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  current = cwd;
  while (true) {
    await scanNodeModules(found, join(current, 'node_modules'));
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return Array.from(found.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}
