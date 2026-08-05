import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Names that mark a directory as a project root. Order does not affect the
 * verdict — a directory qualifies on the first match.
 */
export const PROJECT_ANCHORS = [
  '.claude',
  'AGENTS.md',
  '.codex',
  '.git',
] as const;

/**
 * Test whether `dir` directly owns any project anchor.
 *
 * Existence alone decides, without a directory check: `AGENTS.md` is a file,
 * and `.git` is a file rather than a directory inside a worktree or submodule.
 *
 * @param dir - absolute directory path to probe
 * @returns `true` when at least one anchor exists directly under `dir`
 */
export function hasAnchor(dir: string): boolean {
  for (const anchor of PROJECT_ANCHORS)
    if (existsSync(join(dir, anchor))) return true;
  return false;
}
