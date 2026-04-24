import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve as resolvePath } from 'node:path';

import { logger } from '../../../utils/logger.js';
import { type ResolvedMetadata, resolvePackage } from './resolvePackage.js';

// `runCli/utils/resolveScopeAlias.ts` is the SOLE file in this package
// permitted to enumerate node_modules siblings. Scope aliases
// (`--package @<scope>`) expand here by walking every ancestor of
// `rootCwd` and reading `<ancestor>/node_modules/@<scope>/*/package.json`.
// Every other consumer-metadata path still handles exactly ONE
// explicitly-named target.
export async function resolveScopeAlias(
  scope: string,
  rootCwd: string,
): Promise<ResolvedMetadata[]> {
  const expectedPrefix = `@${scope}/`;
  const seen = new Set<string>();
  const matchedNames: string[] = [];

  let cur = resolvePath(rootCwd);
  while (true) {
    const scopeDir = join(cur, 'node_modules', `@${scope}`);
    await collectScopeDir(scopeDir, expectedPrefix, seen, matchedNames);

    const parent = dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }

  if (matchedNames.length === 0) {
    logger.error(
      `scope alias "@${scope}" matched no installed packages in any ancestor "node_modules/@${scope}/" walking up from ${rootCwd}.`,
    );
    process.exit(2);
  }

  const resolved: ResolvedMetadata[] = [];
  for (const name of matchedNames) {
    const meta = await resolvePackage(name, { skipMissingAsset: true });
    if (meta) resolved.push(meta);
  }
  return resolved;
}

// Enumerate one `node_modules/@<scope>/` directory and append names whose
// `package.json` `name` field starts with `@<scope>/`. Authoritative source
// is the declared package name, not the directory basename. Missing scope
// directories are silently ignored; walking continues to parent ancestors
// so nested node_modules install layouts still resolve.
async function collectScopeDir(
  scopeDir: string,
  expectedPrefix: string,
  seen: Set<string>,
  matchedNames: string[],
): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(scopeDir);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
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
      parsed.name.length > expectedPrefix.length &&
      !seen.has(parsed.name)
    ) {
      seen.add(parsed.name);
      matchedNames.push(parsed.name);
    }
  }
}
