import { homedir } from 'node:os';
import { dirname } from 'node:path';

import { hasAnchor } from './utils/hasAnchor.js';

/** Where injected assets land: the invoking user, or the current project. */
export type Scope = 'user' | 'project';

/** One resolved project root, before any agent-specific path is derived. */
export interface ProjectRootResolution {
  readonly scope: Scope;
  /** Absolute directory every agent derives its asset locations from. */
  readonly projectRoot: string;
  /** True when an ancestor other than the starting directory was chosen. */
  readonly autoLocated: boolean;
}

/**
 * Narrow an unknown value to a supported scope token.
 *
 * @param value - candidate value, typically a raw CLI flag
 * @returns `true` when the value is `'user'` or `'project'`
 */
export function isValidScope(value: unknown): value is Scope {
  return value === 'user' || value === 'project';
}

/**
 * Walk from `start` to the filesystem root and return the first directory
 * that owns a project anchor. `start` itself is the first candidate.
 *
 * @param start - absolute directory to start walking from
 * @returns the nearest anchored ancestor, or `null` when none exists
 */
export function findNearestAnchorAncestor(start: string): string | null {
  let current = start;
  while (true) {
    if (hasAnchor(current)) return current;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

/**
 * Resolve a scope token into the single project root that every selected
 * agent derives its asset locations from.
 *
 * `user` ignores `cwd` and answers with the home directory. `project` walks
 * up for an anchor and falls back to `cwd` when the walk finds none, so the
 * call always yields a usable root.
 *
 * @param scope - target scope
 * @param cwd - directory the `project` walk starts from (defaults to `process.cwd()`)
 * @returns the resolved root and whether it was located above `cwd`
 */
export function resolveProjectRoot(
  scope: Scope,
  cwd: string = process.cwd(),
): ProjectRootResolution {
  if (scope === 'user')
    return { scope, projectRoot: homedir(), autoLocated: false };
  const ancestor = findNearestAnchorAncestor(cwd);
  return {
    scope,
    projectRoot: ancestor ?? cwd,
    autoLocated: ancestor !== null && ancestor !== cwd,
  };
}
