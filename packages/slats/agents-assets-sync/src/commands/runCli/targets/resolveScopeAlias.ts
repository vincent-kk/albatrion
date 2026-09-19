import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve as resolvePath } from 'node:path';

import { findMarkerRoot } from '../../../core/index.js';
import { logger } from '../../../utils/logger.js';
import { findInstallRoots } from './findInstallRoots.js';
import { type ResolvedMetadata, resolvePackage } from './resolvePackage.js';

// `runCli/targets/resolveScopeAlias.ts` is the SOLE file in this package
// permitted to enumerate node_modules siblings. Scope aliases
// (`--package @<scope>`) expand here by walking every ancestor of
// `rootCwd` and reading `<ancestor>/node_modules/@<scope>/*/package.json`,
// then every install root under the project the same way — under pnpm a
// scope is installed per workspace member, never at the workspace root.
// Every other consumer-metadata path still handles exactly ONE
// explicitly-named target.
export async function resolveScopeAlias(
  scope: string,
  rootCwd: string,
  assetPathOverride?: string,
  skipReasons?: string[],
): Promise<ResolvedMetadata[]> {
  const expectedPrefix = `@${scope}/`;
  // Package name → the directory `resolvePackage` must resolve it from.
  const matched = new Map<string, string>();

  let cur = resolvePath(rootCwd);
  while (true) {
    const scopeDir = join(cur, 'node_modules', `@${scope}`);
    await collectScopeDir(scopeDir, expectedPrefix, rootCwd, matched);

    const parent = dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }

  const projectRoot = findMarkerRoot(rootCwd);
  const installRoots = projectRoot ? await findInstallRoots(projectRoot) : [];
  for (const installRoot of installRoots) {
    const scopeDir = join(installRoot, 'node_modules', `@${scope}`);
    await collectScopeDir(scopeDir, expectedPrefix, installRoot, matched);
  }

  if (matched.size === 0) {
    logger.error(
      `scope alias "@${scope}" matched no installed packages in any "node_modules/@${scope}/" walking up from ${rootCwd} or installed under its project root.`,
    );
    process.exit(2);
  }

  // With an override every enumerated package gets the same asset path, so
  // what filters the scope is no longer the `agents.assetPath` declaration
  // but whether that directory exists in each package.
  const resolved: ResolvedMetadata[] = [];
  for (const [name, resolveFrom] of matched) {
    const meta = await resolvePackage(
      name,
      { skipMissingAsset: true, assetPathOverride, skipReasons },
      resolveFrom,
    );
    if (meta) resolved.push(meta);
  }
  return resolved;
}

// Enumerate one `node_modules/@<scope>/` directory and append names whose
// `package.json` `name` field starts with `@<scope>/`. Authoritative source
// is the declared package name, not the directory basename. Missing scope
// directories are silently ignored; walking continues to parent ancestors
// so nested node_modules install layouts still resolve. A name already in
// `matched` keeps its first `resolveFrom` — nearest wins.
async function collectScopeDir(
  scopeDir: string,
  expectedPrefix: string,
  resolveFrom: string,
  matched: Map<string, string>,
): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(scopeDir);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
    const pkgJSONPath = join(scopeDir, entry, 'package.json');
    if (!existsSync(pkgJSONPath)) continue;
    let parsed: { name?: unknown };
    try {
      const raw = await readFile(pkgJSONPath, 'utf-8');
      parsed = JSON.parse(raw) as { name?: unknown };
    } catch {
      continue;
    }
    if (
      typeof parsed.name === 'string' &&
      parsed.name.startsWith(expectedPrefix) &&
      parsed.name.length > expectedPrefix.length &&
      !matched.has(parsed.name)
    ) {
      matched.set(parsed.name, resolveFrom);
    }
  }
}
