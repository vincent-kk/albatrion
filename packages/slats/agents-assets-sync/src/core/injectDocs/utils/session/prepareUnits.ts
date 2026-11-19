import type { ConsumerPackage, DefaultFlags } from '../../../../types/index.js';
import { assertDestinationRootsContained, assertWriteTargetsContained, resolveAgentTarget, resolveDestinations, type ResolvedLocations } from '../../../agentTarget/index.js';
import { buildPlan, collectFileWrites } from '../../../buildPlan/index.js';
import { resolveHashManifest, computeNamespacePrefixes } from '../../../hashManifest/index.js';
import { mergePlans } from './mergePlans.js';
import type { RunUnit, ValidatedFlags } from './types.js';

/** Read all inputs and prepare all units before any destination is written.
 * @param targets Deduplicated packages.
 * @param values Validated arguments.
 * @param flags Execution options.
 * @param cwd Scope resolution origin.
 * @returns Run-wide merged plans, including failed units.
 */
export async function prepareUnits(targets: readonly ConsumerPackage[], values: ValidatedFlags, flags: DefaultFlags, cwd: string): Promise<RunUnit[]> {
  const units: RunUnit[] = [];
  const resolved: ResolvedLocations = new Map();
  const generatedAt = new Date().toISOString();
  for (const target of targets) {
    const manifest = await resolveHashManifest(target, generatedAt).then(value => ({ value }), error => ({ error: String(error) }));
    for (const agent of values.agents) {
      const agentTarget = resolveAgentTarget(agent, values.scope, cwd);
      const base = { key: `${agent}:${target.name}`, target, agentTarget };
      try {
        if ('error' in manifest) throw new Error(manifest.error);
        const { destinations, orphanScans } = resolveDestinations({ agentTarget, packageName: target.name, relPaths: Object.keys(manifest.value.files), namespacePrefixes: computeNamespacePrefixes(manifest.value), assetKinds: values.assetKinds });
        await assertDestinationRootsContained({ agentTarget, assetKinds: values.assetKinds, orphanScans, resolved });
        const plan = await buildPlan({ sourceHashes: manifest.value.files, ...(target.hashSource === 'manifest' ? { assetRoot: target.assetRoot } : {}), destinations, orphanScans, force: Boolean(flags.force) });
        await assertWriteTargetsContained({ agentTarget, dstPaths: collectFileWrites(plan), resolved });
        units.push({ ...base, plan });
      } catch (error) {
        units.push({ ...base, plan: { actions: [], requiresForce: false }, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }
  return mergePlans(units);
}
