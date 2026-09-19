import { homedir } from 'node:os';
import { dirname, sep } from 'node:path';

import { ownsAny } from './utils/ownsAny.js';
import { PROJECT_ANCHORS, PROJECT_ROOT_MARKERS } from './utils/projectMarkers.js';

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
 * that directly owns any of `names`. `start` itself is the first candidate.
 *
 * @param start - absolute directory to start walking from
 * @param names - entry names that qualify a directory
 * @returns the nearest qualifying ancestor, or `null` when none exists
 */
export function findNearestOwner(
  start: string,
  names: readonly string[],
): string | null {
  let current = start;
  while (true) {
    if (ownsAny(current, names)) return current;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

/**
 * Nearest ancestor owning a root marker, with the home directory as a ceiling:
 * a marker at `homedir()` or above it — a dotfiles repository, a stray
 * lockfile — belongs to the user's own configuration and claims no project
 * underneath.
 *
 * @param start - absolute directory to start walking from
 * @returns the marker-owning root strictly below the home ceiling, or `null`
 */
export function findMarkerRoot(start: string): string | null {
  const owner = findNearestOwner(start, PROJECT_ROOT_MARKERS);
  if (owner === null || isAtOrAboveHome(owner)) return null;
  return owner;
}

function isAtOrAboveHome(dir: string): boolean {
  const home = homedir();
  return dir === home || home.startsWith(dir.endsWith(sep) ? dir : dir + sep);
}

/**
 * Locate the project that contains `start`, in two tiers: the nearest ancestor
 * owning a root marker (`findMarkerRoot`), and only when none exists the nearest ancestor owning
 * an agent anchor. A marker outranks a nearer anchor because a tool may drop
 * `.claude` into any workspace member, while a lockfile or `.git` sits only
 * where the package manager or the repository puts its root.
 *
 * @param start - absolute directory to start walking from
 * @returns the project root, or `null` when no ancestor owns a marker or anchor
 */
export function findProjectRoot(start: string): string | null {
  return findMarkerRoot(start) ?? findNearestOwner(start, PROJECT_ANCHORS);
}

/**
 * Resolve a scope token into the single project root that every selected
 * agent derives its asset locations from.
 *
 * `user` ignores `cwd` and answers with the home directory. `project` walks
 * up through `findProjectRoot` and falls back to `cwd` when the walk finds
 * none, so the call always yields a usable root.
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
  const ancestor = findProjectRoot(cwd);
  return {
    scope,
    projectRoot: ancestor ?? cwd,
    autoLocated: ancestor !== null && ancestor !== cwd,
  };
}
