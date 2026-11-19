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
import { mergePlans } from '../mergePlans.js';
import type { RunUnit, ValidatedFlags } from '../types.js';
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
): Promise<RunUnit[]> {
  const units: RunUnit[] = [];
  const resolved: ResolvedLocations = new Map();
  const destinationsSeen = new Map<string, RunUnit>();
  const markdown = new Map<string, Promise<void>>();
  const generatedAt = new Date().toISOString();
  for (const target of targets) {
    const manifest = await resolveHashManifest(target, generatedAt).then(
      (value) => ({ value }),
      (error) => ({ error: String(error) }),
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
      const base = { key: `${agent}:${target.name}`, target, agentTarget };
      try {
        if ('error' in manifest) throw new Error(manifest.error);
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
          ...(target.hashSource === 'manifest'
            ? { assetRoot: target.assetRoot }
            : {}),
          destinations,
          orphanScans,
          force: Boolean(flags.force),
        });
        await validateUnitMarkdown(plan, target.assetRoot, markdown);
        await assertWriteTargetsContained({
          agentTarget,
          dstPaths: collectFileWrites(plan),
          resolved,
        });
        const unit = { ...base, plan };
        destinationsSeen.set(locationKey, unit);
        units.push(unit);
      } catch (error) {
        units.push({
          ...base,
          plan: { actions: [], requiresForce: false },
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
  return mergePlans(units);
}
