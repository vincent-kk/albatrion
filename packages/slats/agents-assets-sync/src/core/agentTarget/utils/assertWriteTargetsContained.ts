import { realpath } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import type { AgentTarget, ResolvedLocations } from '../type.js';
import { findLinkedNames } from './findLinkedNames.js';
import { isWithin } from './isWithin.js';
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
 * this settles everything under them that the plan writes: each distinct
 * destination directory is resolved once per run, and the files written into
 * a directory that already exists are checked for links through one listing
 * of it per run, or one `lstat` per name when only one is written there (see
 * `findLinkedNames`). A file cannot sit in a missing directory, so those cost
 * nothing. Only a link is passed to `realpath`. A link that stays inside the project is
 * allowed, as it is for a root. Deletions need no check: the orphan scan never
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
  for (const [dir, names] of namesByDir) {
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
  const location = await resolveLocation(dir, resolved);
  if (!isWithin(realRoot, location.real)) return dir;
  if (!location.exists) return null;
  for (const name of await findLinkedNames(dir, names, location, resolved))
    if (!isWithin(realRoot, await realpath(join(dir, name)).catch(() => null)))
      return join(dir, name);
  return null;
}
