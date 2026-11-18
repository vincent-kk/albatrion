import {
  type Action,
  type ActionTarget,
  type AgentTarget,
  type AgentType,
  type AssetKind,
  type InjectPlan,
  type InjectReport,
  type ResolvedLocations,
  type Scope,
  applyAction,
  applyBlockActions,
  assertDestinationRootsContained,
  assertWriteTargetsContained,
  buildPlan,
  collectFileWrites,
  computeNamespacePrefixes,
  partitionActions,
  resolveAgentTarget,
  resolveDestinations,
  resolveHashManifest,
  summarize,
} from '../../../core/index.js';
import type { ConsumerPackage, DefaultFlags } from '../../../types/index.js';
import { asyncPool } from '../../../utils/asyncPool.js';
import { logger } from '../../../utils/logger.js';
import { resolveAgentFlag } from '../flags/resolveAgentFlag.js';
import { resolveAssetFlag } from '../flags/resolveAssetFlag.js';
import { resolveScopeFlag } from '../flags/resolveScopeFlag.js';

const COPY_CONCURRENCY = 8;

/**
 * Plain (picocolors) renderer for non-TTY, `--json` and `--no-interactive`
 * invocations.
 *
 * Composes the same `core/**` primitives the Ink pipeline uses. Nothing here
 * prompts, so every required choice must already have arrived as a flag:
 * `resolveScopeFlag` and `resolveAgentFlag` exit 2 when one is missing.
 *
 * Every target handed here can supply hashes — the dispatcher drops the ones
 * that cannot, and owns the verdict for them, so no renderer answers that
 * question on its own.
 *
 * @param targets - resolved consumer packages, all injectable
 * @param flags - parsed CLI flags
 * @param originCwd - directory project-scope resolution starts from
 * @returns the process exit code
 */
export async function renderPlain(
  targets: readonly ConsumerPackage[],
  flags: DefaultFlags,
  originCwd: string,
): Promise<number> {
  if (targets.length === 0) return 0;
  // One stamp for the whole run: a computed manifest records when the run
  // looked, not when each unit happened to reach the hasher.
  const generatedAt = new Date().toISOString();
  // Destination directories repeat across units; resolve each once per run.
  const resolved: ResolvedLocations = new Map();

  const scope = resolveScopeFlag(flags.scope);
  const agents = resolveAgentFlag(flags.agent ?? [], false);
  const assetKinds = resolveAssetFlag(flags.asset ?? []);

  let resultCode = 0;

  for (const target of targets) {
    for (const agent of agents) {
      logger.heading(`${target.name}@${target.version} · ${agent}`);
      let exitCode: number;
      try {
        exitCode = await renderOneUnit(
          target,
          agent,
          scope,
          assetKinds,
          flags,
          originCwd,
          generatedAt,
          resolved,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error(`${target.name} (${agent}): ${msg}`);
        exitCode = 1;
      }

      if (exitCode === 1 || (exitCode === 2 && resultCode === 0))
        resultCode = exitCode;
    }
  }

  return resultCode;
}

async function renderOneUnit(
  target: ConsumerPackage,
  agent: AgentType,
  scope: Scope,
  assetKinds: ReadonlySet<AssetKind>,
  flags: DefaultFlags,
  originCwd: string,
  generatedAt: string,
  resolved: ResolvedLocations,
): Promise<number> {
  const manifest = await resolveHashManifest(target, generatedAt);
  const agentTarget = resolveAgentTarget(agent, scope, originCwd);
  const { destinations, orphanScans } = resolveDestinations({
    agentTarget,
    packageName: target.name,
    relPaths: Object.keys(manifest.files),
    namespacePrefixes: computeNamespacePrefixes(manifest),
    assetKinds,
  });
  await assertDestinationRootsContained({
    agentTarget,
    assetKinds,
    orphanScans,
    resolved,
  });
  const force = flags.force ?? false;
  const plan = await buildPlan({
    sourceHashes: manifest.files,
    destinations,
    orphanScans,
    force,
  });
  await assertWriteTargetsContained({
    agentTarget,
    dstPaths: collectFileWrites(plan),
    resolved,
  });

  logger.info(`${target.name}@${target.version} → ${agentTarget.description}`);
  printPlan(plan, agentTarget);

  // A dry run writes nothing, so a plan that needs --force is reported, not
  // refused: the refusal below tells the user to inspect with --dry-run.
  if (plan.requiresForce && !force) {
    if (!flags.dryRun) {
      logger.error(
        'Re-run with --force to proceed, or inspect with --dry-run.',
      );
      return 2;
    }
    logger.warn('Applying this plan requires --force.');
  }
  if (force) emitForceList(plan);

  if (flags.dryRun) {
    logger.warn('[DRY RUN] No files will be created, overwritten, or deleted.');
    return 0;
  }

  const { fileActions, blockGroups } = partitionActions(plan.actions, force);
  const results = await asyncPool(COPY_CONCURRENCY, fileActions, (action) =>
    applyAction(action, target.assetRoot),
  );
  const failedActions: Action[] = fileActions.filter(
    (_, index) => results[index].status === 'rejected',
  );
  for (const [fileAbs, group] of blockGroups) {
    try {
      await applyBlockActions(fileAbs, group, target.assetRoot);
    } catch {
      failedActions.push(...group);
    }
  }

  for (const action of failedActions)
    logger.error(`Failed to apply: ${action.relPath}`);
  const report: InjectReport = summarize(
    plan,
    failedActions.length ? 1 : 0,
    failedActions,
  );
  return report.exitCode;
}

function printPlan(plan: InjectPlan, agentTarget: AgentTarget): void {
  for (const action of plan.actions) {
    const label = describe(action.relPath, action.target, agentTarget);
    if (action.kind === 'copy') logger.file('create', label);
    else if (action.kind === 'skip-uptodate')
      logger.file('skip', `${label} (up-to-date)`);
    else if (action.kind === 'skip-unsupported')
      logger.file(
        'skip',
        `${label} (${
          action.target.kind === 'unsupported'
            ? action.target.reason
            : 'unsupported'
        })`,
      );
    else if (action.kind === 'warn-diverged')
      logger.warn(
        `${label} — local differs from source (user edit or version change)`,
      );
    else if (action.kind === 'warn-orphan')
      logger.warn(`${label} — present locally, absent in source`);
    else if (action.kind === 'delete')
      logger.file('update', `${label} (deleting)`);
  }
}

// A block lives inside a document shared with other tools, so name that
// document — `rules/x.md` alone would read as a file this tool owns.
function describe(
  relPath: string,
  target: ActionTarget,
  agentTarget: AgentTarget,
): string {
  if (target.kind !== 'block') return relPath;
  const document = target.fileAbs.startsWith(agentTarget.projectRoot)
    ? target.fileAbs.slice(agentTarget.projectRoot.length + 1)
    : target.fileAbs;
  return `${document} ▸ ${relPath}`;
}

// Under --force an orphan is already planned as `delete`, so the list names
// deletions as well as overwrites: either one removes what the user had.
function emitForceList(plan: InjectPlan): void {
  const divergent = plan.actions.filter(
    (action) => action.kind === 'warn-diverged' || action.kind === 'delete',
  );
  if (divergent.length === 0) return;
  process.stderr.write(
    `[agents-assets-sync] --force overwriting or deleting ${divergent.length} entry(ies) in non-interactive mode:\n`,
  );
  for (const action of divergent) process.stderr.write(`  ${action.relPath}\n`);
}
