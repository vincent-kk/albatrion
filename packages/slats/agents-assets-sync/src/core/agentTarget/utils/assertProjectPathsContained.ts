import type {
  AgentTarget,
  AssetKind,
  PlanningOrphanScan,
  ResolvedLocations,
} from '../type.js';
import { findWriteEscape } from './assertProjectPathsContained/findWriteEscape.js';
import { isWithin } from './isWithin.js';
import { resolveLocation } from './resolveLocation.js';

/** Paths known before planning, or the exact files selected by a plan. */
type Inspection =
  | {
      readonly assetKinds: ReadonlySet<AssetKind>;
      readonly orphanScans: readonly PlanningOrphanScan[];
    }
  | { readonly dstPaths: readonly string[] };

/** Paths and per-run cache supplied by the planner. */
type AssertProjectPathsContainedInput = {
  readonly agentTarget: AgentTarget;
  readonly resolved: ResolvedLocations;
} & Inspection;

/**
 * Refuse any project destination carried outside the checkout by a link.
 * @param input Target, per-run cache, and either roots or concrete writes.
 * @throws When the first checked path resolves outside the project or through a dangling link.
 */
export async function assertProjectPathsContained(
  input: AssertProjectPathsContainedInput,
): Promise<void> {
  const { agentTarget, resolved } = input;
  if (agentTarget.scope !== 'project') return;
  const { projectRoot } = agentTarget;
  const realRoot =
    (await resolveLocation(projectRoot, resolved)).real ?? projectRoot;
  let escaped: string | undefined;
  if ('dstPaths' in input)
    escaped = await findWriteEscape(input.dstPaths, realRoot, resolved);
  else {
    const { directoryRoots, rulesMergeFile } = agentTarget;
    const roots: string[] = [];
    for (const kind of input.assetKinds) {
      const root = directoryRoots[kind];
      if (root !== null) roots.push(root);
    }
    if (input.assetKinds.has('rules') && rulesMergeFile !== null)
      roots.push(rulesMergeFile);
    for (const scan of input.orphanScans)
      if (scan.kind === 'directory') roots.push(scan.scanRoot);

    for (const root of roots) {
      const { real } = await resolveLocation(root, resolved);
      if (isWithin(realRoot, real)) continue;
      escaped = root;
      break;
    }
  }
  if (escaped !== undefined)
    throw new Error(
      `[agents-assets-sync] ${escaped} resolves outside the project root ${projectRoot} through a symbolic link; project-scope destinations must stay inside the project.`,
    );
}
