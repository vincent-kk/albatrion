import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

import { isDirectory } from './utils/isDirectory.js';

export type Scope = 'user' | 'project' | 'local';

export interface ScopeResolution {
  scope: Scope;
  targetRoot: string;
  isGitIgnoredRegion: boolean;
  description: string;
}

export function isValidScope(value: unknown): value is Scope {
  return value === 'user' || value === 'project' || value === 'local';
}

/**
 * Walk parent directories of `start` and return the first ancestor that
 * already contains a `.claude` directory. Returns the ancestor path itself
 * (not `/.claude`), or `null` when no such ancestor exists up to the
 * filesystem root. `start` itself is considered as the first candidate.
 */
export function findNearestDotClaudeAncestor(start: string): string | null {
  let current = start;
  while (true) {
    if (isDirectory(join(current, '.claude'))) return current;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export function resolveScope(
  scope: Scope,
  cwd: string = process.cwd(),
): ScopeResolution {
  if (scope === 'user') {
    return {
      scope,
      targetRoot: join(homedir(), '.claude'),
      isGitIgnoredRegion: false,
      description: '~/.claude (user)',
    };
  }
  const ancestor = findNearestDotClaudeAncestor(cwd);
  const base = ancestor ?? cwd;
  const autoLocated = ancestor !== null;
  if (scope === 'project') {
    return {
      scope,
      targetRoot: join(base, '.claude'),
      isGitIgnoredRegion: false,
      description: autoLocated
        ? `${base}/.claude (project, auto-located)`
        : `${base}/.claude (project)`,
    };
  }
  return {
    scope,
    targetRoot: join(base, '.claude'),
    isGitIgnoredRegion: true,
    description: autoLocated
      ? `${base}/.claude (local, auto-located, expected to be gitignored)`
      : `${base}/.claude (local, expected to be gitignored)`,
  };
}

export function isInteractive(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
