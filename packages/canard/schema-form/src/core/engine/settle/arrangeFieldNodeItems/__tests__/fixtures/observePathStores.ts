import type { FieldNodeRuntime } from '@/schema-form/core/engine/record';

/** Positions probed beneath the host, beyond any count used by the tests. */
const PROBED_POSITIONS = 12;

/**
 * Observe every runtime path store by contents and by path-index lookups around one host.
 * @param runtime - Tree-owned stores, warning indexes and rule indexes
 * @param hostPath - Array host whose subtree, slots and ancestors are probed
 * @returns Per store: entries in order, sorted subtree keys at each probe, sorted host slots and ancestor-inclusive keys of slot 0;
 *   plus the warning path index, rule source and target indexes and the latent dirty flag
 */
export const observePathStores = <Self>(
  runtime: FieldNodeRuntime<Self>,
  hostPath: string,
): unknown => {
  const probes = ['', hostPath];
  for (let index = 0; index < PROBED_POSITIONS; index++)
    probes.push(hostPath + '/' + index);
  const stores = {
    latent: runtime.latentRaw,
    metadata: runtime.latentRawMetadata,
    declarations: runtime.committedDeclarationIds,
    rules: runtime.committedRuleValues,
    misfits: runtime.misfitPaths,
    misfitsMemo: runtime.misfitsMemo,
    inactiveMemo: runtime.inactiveValuesMemo,
    inactiveEntries: runtime.inactiveValueEntries,
  };
  const observed: Record<string, unknown> = {};
  for (const [name, store] of Object.entries(stores))
    observed[name] = store && {
      entries: [...store],
      under: probes.map((path) => [...store.pathIndex.under(path)].sort()),
      tail: [...store.pathIndex.tail(hostPath, 0)].sort(),
      intersecting: [...store.pathIndex.intersecting(hostPath + '/0')].sort(),
    };
  return {
    ...observed,
    warningPaths: [...(runtime.warningKeysByPath ?? [])].map(([path, keys]) => [
      path,
      [...keys].sort(),
    ]),
    ruleSources: [...(runtime.committedRuleKeysBySource ?? [])],
    ruleTargets: [...(runtime.committedRuleKeysByTarget ?? [])],
    latentRawDirty: runtime.latentRawDirty,
  };
};
