import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Test whether `dir` directly owns any of the given entries.
 *
 * Existence alone decides, without a directory check: `AGENTS.md` is a file,
 * and `.git` is a file rather than a directory inside a worktree or submodule.
 *
 * @param dir - absolute directory path to probe
 * @param names - entry names to look for directly under `dir`
 * @returns `true` when at least one of `names` exists directly under `dir`
 */
export function ownsAny(dir: string, names: readonly string[]): boolean {
  for (const name of names) if (existsSync(join(dir, name))) return true;
  return false;
}
