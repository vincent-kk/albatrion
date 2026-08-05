import {
  type ActionTarget,
  type AgentTarget,
  type AgentType,
  type AssetKind,
  type InjectPlan,
  type InjectReport,
  type Scope,
  applyAction,
  applyBlockActions,
  buildPlan,
  computeNamespacePrefixes,
  partitionActions,
  readHashManifest,
  resolveAgentTarget,
  resolveDestinations,
  summarize,
} from '../../../core/index.js';
import { asyncPool } from '../../../utils/asyncPool.js';
import { logger } from '../../../utils/logger.js';
import type { ConsumerPackage, DefaultFlags } from '../../../types/index.js';
import { resolveAgentFlag } from './resolveAgentFlag.js';
import { resolveAssetFlag } from './resolveAssetFlag.js';
import { resolveScopeFlag } from './resolveScopeFlag.js';

const COPY_CONCURRENCY = 8;

/**
 * Plain (picocolors) renderer for non-TTY, `--json` and `--no-interactive`
 * invocations.
 *
 * Composes the same `core/**` primitives the Ink pipeline uses. Nothing here
 * prompts, so every required choice must already have arrived as a flag:
 * `resolveScopeFlag` and `resolveAgentFlag` exit 2 when one is missing.
 *
 * @param targets - resolved consumer packages
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

  const scope = resolveScopeFlag(flags.scope);
  const agents = resolveAgentFlag(flags.agent ?? [], false);
  const assetKinds = resolveAssetFlag(flags.asset ?? []);

  const usable = targets.filter((target) => {
    if (target.hashesPresent) return true;
    logger.warn(
      `${target.name}: dist/agents-hashes.json missing — build the package (e.g. yarn build) to regenerate the hash manifest first.`,
    );
    return false;
  });

  const fatalOnError = usable.length * agents.length === 1;
  let failureCount = 0;

  for (const target of usable) {
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
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error(`${target.name} (${agent}): ${msg}`);
        exitCode = 1;
      }

      if (exitCode !== 0) {
        if (fatalOnError) return exitCode;
        failureCount += 1;
      }
    }
  }

  return failureCount > 0 ? 1 : 0;
}

async function renderOneUnit(
  target: ConsumerPackage,
  agent: AgentType,
  scope: Scope,
  assetKinds: ReadonlySet<AssetKind>,
  flags: DefaultFlags,
  originCwd: string,
): Promise<number> {
  const manifest = await readHashManifest(target.packageRoot);
  const agentTarget = resolveAgentTarget(agent, scope, originCwd);
  const { destinations, orphanScans } = resolveDestinations({
    agentTarget,
    packageName: target.name,
    relPaths: Object.keys(manifest.files),
    namespacePrefixes: computeNamespacePrefixes(manifest),
    assetKinds,
  });
  const force = flags.force ?? false;
  const plan = await buildPlan({
    sourceHashes: manifest.files,
    destinations,
    orphanScans,
    force,
  });

  logger.info(`${target.name}@${target.version} → ${agentTarget.description}`);
  printPlan(plan, agentTarget);

  if (plan.requiresForce && !force) {
    logger.error('Re-run with --force to proceed, or inspect with --dry-run.');
    return 2;
  }
  if (force) emitForceList(plan);

  if (flags.dryRun) {
    logger.warn('[DRY RUN] No files will be created, overwritten, or deleted.');
    return 0;
  }

  const { fileActions, blockGroups } = partitionActions(plan.actions, force);
  await asyncPool(COPY_CONCURRENCY, fileActions, (action) =>
    applyAction(action, target.assetRoot),
  );
  // Serialised on purpose: one document, one read-modify-write.
  for (const [fileAbs, group] of blockGroups)
    await applyBlockActions(fileAbs, group, target.assetRoot);

  const report: InjectReport = summarize(plan, 0);
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

function emitForceList(plan: InjectPlan): void {
  const divergent = plan.actions.filter(
    (action) =>
      action.kind === 'warn-diverged' || action.kind === 'warn-orphan',
  );
  if (divergent.length === 0) return;
  process.stderr.write(
    `[agents-assets-sync] --force overwriting ${divergent.length} entry(ies) in non-interactive mode:\n`,
  );
  for (const action of divergent) process.stderr.write(`  ${action.relPath}\n`);
}
