import type {
  ConsumerPackage,
  DefaultFlags,
} from '../../../../../types/index.js';
import {
  type ResolvedLocations,
  assertDestinationRootsContained,
  assertWriteTargetsContained,
  resolveAgentTarget,
  resolveDestinations,
} from '../../../../agentTarget/index.js';
import { buildPlan, collectFileWrites } from '../../../../buildPlan/index.js';
import {
  computeNamespacePrefixes,
  resolveHashManifest,
} from '../../../../hashManifest/index.js';
import type { RuleSource } from '../../../../types/ruleSource.js';
import { mergePlans } from '../mergePlans.js';
import type { RunUnit, ValidatedFlags } from '../types.js';
import { describePreparationFailure } from './utils/describePreparationFailure.js';
import { resolveCanonicalPath } from './utils/resolveCanonicalPath.js';
import { validateUnitMarkdown } from './utils/validateUnitMarkdown.js';

/** Read all inputs and prepare all units before any destination is written.
 * @param targets Deduplicated packages.
 * @param values Validated arguments.
 * @param flags Execution options.
 * @param cwd Scope resolution origin.
 * @returns Run-wide merged plans, including failed units.
 */
export async function prepareUnits(
  targets: readonly ConsumerPackage[],
  values: ValidatedFlags,
  flags: DefaultFlags,
  cwd: string,
  discoveryFailures: readonly string[] = [],
): Promise<RunUnit[]> {
  const units: RunUnit[] = [];
  const resolved: ResolvedLocations = new Map();
  const destinationsSeen = new Map<string, RunUnit>();
  const markdown = new Map<string, Promise<void>>();
  const physicalPaths = new Map<string, Promise<string>>();
  const generatedAt = new Date().toISOString();
  const ruleSources = new Map<string, RuleSource | null>();
  for (const target of targets) {
    const manifest = await resolveHashManifest(
      target,
      generatedAt,
      ruleSources,
    ).then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    );
    for (const agent of values.agents) {
      const agentTarget = resolveAgentTarget(agent, values.scope, cwd);
      const locationKey = JSON.stringify([
        target.name,
        agentTarget.scope,
        agentTarget.directoryRoots,
        agentTarget.rulesMergeFile,
        agentTarget.unsupported,
      ]);
      const existing = destinationsSeen.get(locationKey);
      if (existing) {
        units.push({
          ...existing,
          key: `${agent}:${target.name}`,
          agentTarget,
          aliasOf: existing.key,
          plan: { actions: [], requiresForce: false },
        });
        continue;
      }
      const namespaceRoots = await Promise.all(
        Object.values(agentTarget.directoryRoots)
          .filter((root): root is string => root !== null)
          .map((root) =>
            resolveCanonicalPath(root, physicalPaths).catch(() => root),
          ),
      );
      const base = {
        key: `${agent}:${target.name}`,
        target,
        agentTarget,
        namespaceRoots,
      };
      try {
        if ('error' in manifest) throw manifest.error;
        const { destinations, orphanScans } = resolveDestinations({
          agentTarget,
          packageName: target.name,
          relPaths: Object.keys(manifest.value.files),
          namespacePrefixes: computeNamespacePrefixes(manifest.value),
          assetKinds: values.assetKinds,
        });
        await assertDestinationRootsContained({
          agentTarget,
          assetKinds: values.assetKinds,
          orphanScans,
          resolved,
        });
        const plan = await buildPlan({
          sourceHashes: manifest.value.files,
          ruleBodyHashes: manifest.value.ruleBodyHashes,
          ruleSources,
          assetRoot: target.assetRoot,
          destinations,
          orphanScans,
          force: Boolean(flags.force),
        });
        await validateUnitMarkdown(
          plan,
          target.assetRoot,
          markdown,
          ruleSources,
        );
        await assertWriteTargetsContained({
          agentTarget,
          dstPaths: collectFileWrites(plan),
          resolved,
        });
        const actions = await Promise.all(
          plan.actions.map(async (action) =>
            action.target.kind === 'file'
              ? {
                  ...action,
                  destinationKey: await resolveCanonicalPath(
                    action.target.dstAbs,
                    physicalPaths,
                  ),
                }
              : action,
          ),
        );
        const unit = { ...base, ruleSources, plan: { ...plan, actions } };
        destinationsSeen.set(locationKey, unit);
        units.push(unit);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        units.push({
          ...base,
          plan: { actions: [], requiresForce: false },
          error: reason,
          failures: [
            {
              unitKey: base.key,
              ...describePreparationFailure(error, target, 'error' in manifest),
              stage: 'prepare',
              reason,
            },
          ],
        });
      }
    }
  }
  return mergePlans(units, discoveryFailures);
}
