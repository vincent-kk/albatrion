import {
  type Action,
  type AgentType,
  type AssetKind,
  type InjectReport,
  type Scope,
  applyAction,
  applyBlockActions,
  buildPlan,
  computeNamespacePrefixes,
  needsBuiltManifest,
  partitionActions,
  resolveAgentTarget,
  resolveDestinations,
  resolveHashManifest,
  summarize,
} from '../../../core/index.js';
import type { ConsumerPackage, DefaultFlags } from '../../../types/index.js';
import { asyncPool } from '../../../utils/asyncPool.js';
import { VERSION } from '../../../utils/version.js';
import { parseAgentFlag } from '../flags/resolveAgentFlag.js';
import { parseAssetFlag } from '../flags/resolveAssetFlag.js';
import { parseScopeFlag } from '../flags/resolveScopeFlag.js';

const COPY_CONCURRENCY = 8;

/** One `(package, agent)` pair's outcome. */
interface JsonUnit {
  readonly package: { readonly name: string; readonly version: string };
  readonly agent: AgentType;
  readonly scope: Scope;
  readonly projectRoot: string;
  /** Human-readable summary of where this unit writes. */
  readonly destination: string;
  readonly requiresForce: boolean;
  readonly actions: readonly Action[];
  readonly report: InjectReport | null;
  /** Present when this unit could not be planned or applied. */
  readonly error?: string;
}

/** The whole document `--json` writes to stdout. */
interface JsonDocument {
  readonly schemaVersion: 1;
  readonly tool: 'agents-assets-sync';
  readonly version: string;
  readonly dryRun: boolean;
  readonly exitCode: 0 | 1 | 2;
  readonly errors: readonly string[];
  readonly units: readonly JsonUnit[];
}

/**
 * Machine-readable renderer for `--json`.
 *
 * Writes exactly one JSON document to stdout and nothing else — diagnostics
 * are diverted to stderr by the caller, because a single stray line would
 * make the stream unparseable. A failure is part of the document rather than
 * a reason to skip it, so a reader always has something to parse.
 *
 * @param targets - resolved consumer packages
 * @param flags - parsed CLI flags
 * @param originCwd - directory project-scope resolution starts from
 * @returns the process exit code
 */
export async function renderJson(
  targets: readonly ConsumerPackage[],
  flags: DefaultFlags,
  originCwd: string,
): Promise<number> {
  const dryRun = Boolean(flags.dryRun);
  const generatedAt = new Date().toISOString();
  const scope = parseScopeFlag(flags.scope);
  const agents = parseAgentFlag(flags.agent ?? [], false);
  const assets = parseAssetFlag(flags.asset ?? []);

  const errors = [
    ...('error' in scope ? scope.error : []),
    ...('error' in agents ? agents.error : []),
    ...('error' in assets ? assets.error : []),
  ];
  if ('error' in scope || 'error' in agents || 'error' in assets)
    return emit(dryRun, 2, errors, []);

  const units: JsonUnit[] = [];
  let exitCode: 0 | 1 | 2 = 0;

  for (const target of targets) {
    for (const agent of agents.agents) {
      const unit = await runUnit(
        target,
        agent,
        scope.scope,
        assets.kinds,
        flags,
        originCwd,
        generatedAt,
      );
      units.push(unit);
      if (unit.error) exitCode = 1;
      else if (unit.requiresForce && !flags.force) exitCode = 2;
    }
  }

  return emit(dryRun, exitCode, errors, units);
}

async function runUnit(
  target: ConsumerPackage,
  agent: AgentType,
  scope: Scope,
  assetKinds: ReadonlySet<AssetKind>,
  flags: DefaultFlags,
  originCwd: string,
  generatedAt: string,
): Promise<JsonUnit> {
  const agentTarget = resolveAgentTarget(agent, scope, originCwd);
  const base = {
    package: { name: target.name, version: target.version },
    agent,
    scope,
    projectRoot: agentTarget.projectRoot,
    destination: agentTarget.description,
  } as const;

  if (needsBuiltManifest(target))
    return {
      ...base,
      requiresForce: false,
      actions: [],
      report: null,
      error:
        'dist/agents-hashes.json missing — build the package to regenerate the hash manifest first, or pass --asset-path to hash the asset directory instead.',
    };

  try {
    const manifest = await resolveHashManifest(target, generatedAt);
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

    const blocked = plan.requiresForce && !force;
    if (blocked || flags.dryRun)
      return {
        ...base,
        requiresForce: plan.requiresForce,
        actions: plan.actions,
        report: summarize(plan, blocked ? 2 : 0),
      };

    const { fileActions, blockGroups } = partitionActions(plan.actions, force);
    await asyncPool(COPY_CONCURRENCY, fileActions, (action) =>
      applyAction(action, target.assetRoot),
    );
    for (const [fileAbs, group] of blockGroups)
      await applyBlockActions(fileAbs, group, target.assetRoot);

    return {
      ...base,
      requiresForce: plan.requiresForce,
      actions: plan.actions,
      report: summarize(plan, 0),
    };
  } catch (error) {
    return {
      ...base,
      requiresForce: false,
      actions: [],
      report: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function emit(
  dryRun: boolean,
  exitCode: 0 | 1 | 2,
  errors: readonly string[],
  units: readonly JsonUnit[],
): number {
  const document: JsonDocument = {
    schemaVersion: 1,
    tool: 'agents-assets-sync',
    version: VERSION,
    dryRun,
    exitCode,
    errors,
    units,
  };
  process.stdout.write(`${JSON.stringify(document, null, 2)}\n`);
  return exitCode;
}
