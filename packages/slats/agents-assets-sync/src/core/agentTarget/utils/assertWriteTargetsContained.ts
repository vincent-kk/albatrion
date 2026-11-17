import { lstat, realpath } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { AgentTarget, ResolvedLocations } from '../type.js';
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
 * destination directory is resolved once per run, and a destination file is
 * checked with one `lstat` only when its directory already exists, since a
 * file cannot be there otherwise. A link that stays inside the project is
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
  for (const dstAbs of dstPaths) {
    const escape = await findEscape(dstAbs, realRoot ?? projectRoot, resolved);
    if (escape === null) continue;
    throw new Error(
      `[agents-assets-sync] ${escape} resolves outside the project root ${projectRoot} through a symbolic link; project-scope destinations must stay inside the project.`,
    );
  }
}

// The directory or file that carries `dstAbs` outside `realRoot`, or `null`.
async function findEscape(
  dstAbs: string,
  realRoot: string,
  resolved: ResolvedLocations,
): Promise<string | null> {
  const dir = dirname(dstAbs);
  const location = await resolveLocation(dir, resolved);
  if (!isWithin(realRoot, location.real)) return dir;
  if (!location.exists) return null;
  if (!(await lstat(dstAbs).catch(() => null))?.isSymbolicLink()) return null;
  const real = await realpath(dstAbs).catch(() => null);
  return isWithin(realRoot, real) ? null : dstAbs;
}
