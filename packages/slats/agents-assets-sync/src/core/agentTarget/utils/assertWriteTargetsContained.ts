import { realpath } from 'node:fs/promises';
import { basename, dirname, join, sep } from 'node:path';

import type { AgentTarget, ResolvedLocations } from '../type.js';
import { findLinkedNames } from './findLinkedNames.js';
import { isWithin } from './isWithin.js';
import { locateDirectory } from './locateDirectory.js';
import { resolveLocation } from './resolveLocation.js';

interface AssertWriteTargetsContainedInput {
  readonly agentTarget: AgentTarget;
  /** Destination files the plan copies or overwrites. */
  readonly dstPaths: readonly string[];
  /** Per-run cache shared by every unit of the run. */
  readonly resolved: ResolvedLocations;
}

/**
 * Refuse a project-scope write that a symbolic link below a destination root
 * would carry outside the project.
 *
 * `assertDestinationRootsContained` settles the roots and skill namespaces;
 * this settles everything under them that the plan writes. Directories are
 * visited deepest first and resolved from their parents' listings
 * (`locateDirectory`), so with `resolved` shared with the roots check an
 * existing subdirectory costs one listing that the files written into its
 * parent then reuse, and anything below a missing directory costs nothing.
 * Files are judged by those listings, or by one `lstat` where no listing is
 * at hand (`findLinkedNames`). Only a link is passed to `realpath`. A link
 * that stays inside the project is allowed, as it is for a root. Deletions need no check: the orphan scan never
 * follows a link, so it never proposes a path through one. User scope is
 * exempt, as for the roots.
 *
 * @param input - the target, the paths to write and the run's cache
 * @throws when a destination directory or file resolves outside
 *   `realpath(projectRoot)`, or through a dangling link; the message names it
 */
export async function assertWriteTargetsContained({
  agentTarget,
  dstPaths,
  resolved,
}: AssertWriteTargetsContainedInput): Promise<void> {
  if (agentTarget.scope !== 'project') return;
  const { projectRoot } = agentTarget;
  const realRoot = (await resolveLocation(projectRoot, resolved)).real;
  const namesByDir = new Map<string, string[]>();
  for (const dstAbs of dstPaths) {
    const dir = dirname(dstAbs);
    const names = namesByDir.get(dir);
    if (names === undefined) namesByDir.set(dir, [basename(dstAbs)]);
    else names.push(basename(dstAbs));
  }
  // Deepest first: a deeper directory's walk lists its ancestors, which the
  // files written into those ancestors then reuse.
  const dirs = [...namesByDir.keys()].sort(
    (a, b) => b.split(sep).length - a.split(sep).length,
  );
  for (const dir of dirs) {
    const names = namesByDir.get(dir) ?? [];
    const escape = await findEscape(
      dir,
      names,
      realRoot ?? projectRoot,
      resolved,
    );
    if (escape === null) continue;
    throw new Error(
      `[agents-assets-sync] ${escape} resolves outside the project root ${projectRoot} through a symbolic link; project-scope destinations must stay inside the project.`,
    );
  }
}

// The directory, or the file written into it, that carries a write outside
// `realRoot`; `null` when every write into `dir` stays inside.
async function findEscape(
  dir: string,
  names: readonly string[],
  realRoot: string,
  resolved: ResolvedLocations,
): Promise<string | null> {
  const located = await locateDirectory(dir, resolved);
  if (!isWithin(realRoot, located.real)) return dir;
  if (!located.exists) return null;
  const location = resolved.get(dir) ?? located;
  for (const name of await findLinkedNames(dir, names, location, resolved))
    if (!isWithin(realRoot, await realpath(join(dir, name)).catch(() => null)))
      return join(dir, name);
  return null;
}
