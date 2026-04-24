import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve as resolvePath } from 'node:path';

import { logger } from '../../../utils/logger.js';
import { resolvePackage, type ResolvedMetadata } from './resolvePackage.js';

// `runCli/utils/resolveScopeAlias.ts` is the SOLE file in this package
// permitted to enumerate workspace siblings. Scope aliases (`--package
// @canard`) expand here; every other consumer-metadata path still
// handles exactly ONE explicitly-named target.
export async function resolveScopeAlias(
  scope: string,
  rootCwd: string,
): Promise<ResolvedMetadata[]> {
  const packagesRoot = findPackagesRoot(rootCwd);
  if (!packagesRoot) {
    logger.error(
      `cannot locate a monorepo root with a "packages/" directory starting from "${rootCwd}". Scope alias "@${scope}" requires a workspace root.`,
    );
    process.exit(2);
  }

  const scopeDir = join(packagesRoot, 'packages', scope);
  let entries: string[];
  try {
    entries = await readdir(scopeDir);
  } catch {
    logger.error(
      `scope alias "@${scope}" has no matching directory at ${scopeDir}.`,
    );
    process.exit(2);
  }

  const matchedNames: string[] = [];
  const expectedPrefix = `@${scope}/`;
  for (const entry of entries) {
    const pkgJsonPath = join(scopeDir, entry, 'package.json');
    if (!existsSync(pkgJsonPath)) continue;
    let parsed: { name?: unknown };
    try {
      const raw = await readFile(pkgJsonPath, 'utf-8');
      parsed = JSON.parse(raw) as { name?: unknown };
    } catch {
      continue;
    }
    if (
      typeof parsed.name === 'string' &&
      parsed.name.startsWith(expectedPrefix) &&
      parsed.name.length > expectedPrefix.length
    ) {
      matchedNames.push(parsed.name);
    }
  }

  if (matchedNames.length === 0) {
    logger.warn(
      `scope alias "@${scope}" matched no workspace packages under ${scopeDir}.`,
    );
    return [];
  }

  const resolved: ResolvedMetadata[] = [];
  for (const name of matchedNames) {
    const meta = await resolvePackage(name, { skipMissingAsset: true });
    if (meta) resolved.push(meta);
  }
  return resolved;
}

// Walk upwards from `start` looking for an ancestor that owns both a
// `package.json` and a `packages/` directory. The `package.json` check
// filters arbitrary ancestors that merely happen to contain `packages/`.
function findPackagesRoot(start: string): string | null {
  let cur = resolvePath(start);
  while (true) {
    if (existsSync(join(cur, 'package.json')) && existsSync(join(cur, 'packages'))) {
      return cur;
    }
    const parent = dirname(cur);
    if (parent === cur) return null;
    cur = parent;
  }
}
