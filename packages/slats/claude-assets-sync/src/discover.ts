import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

export interface ConsumerPackage {
  name: string;
  version: string;
  packageRoot: string;
  assetRoot: string;
  hashesPresent: boolean;
}

export interface DiscoverOptions {
  cwd?: string;
  includeWorkspaces?: boolean;
}

interface PkgJson {
  name?: string;
  version?: string;
  claude?: { assetPath?: string };
  workspaces?: string[] | { packages?: string[] };
}

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

async function readJsonOpt(path: string): Promise<PkgJson | null> {
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as PkgJson;
  } catch {
    return null;
  }
}

async function tryAdd(
  found: Map<string, ConsumerPackage>,
  packageRoot: string,
  pkg: PkgJson,
): Promise<void> {
  const assetPath = pkg.claude?.assetPath;
  if (typeof assetPath !== 'string' || assetPath.length === 0) return;
  if (!pkg.name) return;
  if (found.has(pkg.name)) return;
  const assetRoot = resolve(packageRoot, assetPath);
  const hashesPath = join(packageRoot, 'dist', 'claude-hashes.json');
  const hashesPresent = await stat(hashesPath).then(
    () => true,
    () => false,
  );
  found.set(pkg.name, {
    name: pkg.name,
    version: pkg.version ?? 'unknown',
    packageRoot,
    assetRoot,
    hashesPresent,
  });
}

async function enumerateWorkspaces(
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

async function expandGlob(
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

async function scanNodeModules(
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
