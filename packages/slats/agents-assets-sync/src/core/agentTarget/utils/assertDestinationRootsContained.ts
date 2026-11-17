import type {
  AgentTarget,
  AssetKind,
  OrphanScan,
  ResolvedLocations,
} from '../type.js';
import { isWithin } from './isWithin.js';
import { resolveLocation } from './resolveLocation.js';

interface AssertDestinationRootsContainedInput {
  readonly agentTarget: AgentTarget;
  /** Kinds the run writes; roots of other kinds are not this run's concern. */
  readonly assetKinds: ReadonlySet<AssetKind>;
  /** From `resolveDestinations`; each directory scan root is a skill namespace. */
  readonly orphanScans: readonly OrphanScan[];
}

/**
 * Refuse a project-scope destination that a symbolic link resolves outside
 * the project.
 *
 * A repository can commit symlinks, so a cloned project's `.claude/skills`
 * or `.claude/skills/<namespace>` could send copies and `--force` deletions
 * anywhere on disk. Each kind root, the rules merge file and each skill
 * namespace directory is resolved once; files are not checked one by one.
 * User scope is exempt: linking `~/.claude` to a dotfiles repository is a
 * deliberate setup.
 *
 * @param input - the target, the requested kinds and the orphan scans
 * @throws when a checked path resolves outside `realpath(projectRoot)`, or is
 *   a dangling symbolic link; the message names that path
 */
export async function assertDestinationRootsContained({
  agentTarget,
  assetKinds,
  orphanScans,
}: AssertDestinationRootsContainedInput): Promise<void> {
  if (agentTarget.scope !== 'project') return;
  const { projectRoot, directoryRoots, rulesMergeFile } = agentTarget;
  const roots: string[] = [];
  for (const kind of assetKinds) {
    const root = directoryRoots[kind];
    if (root !== null) roots.push(root);
  }
  if (assetKinds.has('rules') && rulesMergeFile !== null)
    roots.push(rulesMergeFile);
  for (const scan of orphanScans)
    if (scan.kind === 'directory') roots.push(scan.scanRoot);

  const resolved: ResolvedLocations = new Map();
  const realRoot = (await resolveLocation(projectRoot, resolved)).real;
  for (const root of roots) {
    const { real } = await resolveLocation(root, resolved);
    if (isWithin(realRoot ?? projectRoot, real)) continue;
    throw new Error(
      `[agents-assets-sync] ${root} resolves outside the project root ${projectRoot} through a symbolic link; project-scope destinations must stay inside the project.`,
    );
  }
}
