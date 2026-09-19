import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Levels below the project root that are searched. Workspace members sit a
 * few levels down; the cap keeps a stray lockfile in a home directory from
 * turning a failed lookup into a disk scan.
 */
const MAX_DEPTH = 4;

/**
 * List the directories under `projectRoot` that own a `node_modules`. pnpm
 * installs a dependency into the workspace member that declares it, so a run
 * at the workspace root must look below the root to find it.
 *
 * Only ownership is tested: no `node_modules` and no dot directory is ever
 * entered, and symlinked directories are not followed.
 *
 * @param projectRoot - absolute directory the search starts from, inclusive
 * @returns install roots parent-first in name order, then pnpm's hoist
 *   directory `<projectRoot>/node_modules/.pnpm` when present — last, because
 *   it holds one arbitrary version of each name
 */
export async function findInstallRoots(projectRoot: string): Promise<string[]> {
  const roots = await walkInstallRoots(projectRoot, MAX_DEPTH);
  const hoist = join(projectRoot, 'node_modules', '.pnpm');
  if (existsSync(join(hoist, 'node_modules'))) roots.push(hoist);
  return roots;
}

async function walkInstallRoots(dir: string, depth: number): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const names = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const own = names.includes('node_modules') ? [dir] : [];
  if (depth === 0) return own;
  const children = names.filter(isSearchable).sort();
  const nested = children.map((n) => walkInstallRoots(join(dir, n), depth - 1));
  return [...own, ...(await Promise.all(nested)).flat()];
}

function isSearchable(name: string): boolean {
  return name !== 'node_modules' && !name.startsWith('.');
}
