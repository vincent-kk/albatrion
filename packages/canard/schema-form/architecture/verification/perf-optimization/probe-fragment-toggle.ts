/**
 * Loaded directly by tsx/Bun. P-08: one owner write selects F fragments
 * contributing controls to the same child; publishStateKeys then calls
 * calculateStateKeys -> getControlLayers with the owner genuinely dirty.
 * Reset writes and correctness checks are outside each timed false->true write.
 */
import { performance } from 'node:perf_hooks';

import { isRuntimeFieldNode as isTestFieldNode } from '../../../bench/distEngine/isRuntimeFieldNode';
import { loadDistEngine } from '../../../bench/distEngine/loadDistEngine';
import type { TestFieldNode } from '../../../src/core/__tests__/fixtures/testFieldNode';
import type { BlueprintSchema } from '../../../src/core/engine';

const {
  SetValueOption,
  blueprint,
  fieldNodeFactory,
  PathKeyedMap,
  PathKeyedSet,
  loadFieldNodeAtMount,
  getControlLayers,
  distSha256,
} = await loadDistEngine();
const engine = { source: 'dist', distSha256 };

const smoke = process.argv.includes('--smoke');
const warmups = smoke ? 2 : 20;
const samples = smoke ? 3 : 100;

/** Return an interpolated quantile of a nonempty sorted timing array. */
function quantile(sorted: number[], p: number): number {
  const at = (sorted.length - 1) * p;
  const low = Math.floor(at);
  return sorted[low] + (sorted[Math.ceil(at)] - sorted[low]) * (at - low);
}

const sizes = (smoke ? [16] : [16, 32, 64, 128]).map((n) => {
  const schema: BlueprintSchema = {
    type: 'object',
    properties: { enabled: { type: 'boolean' }, target: { type: 'string' } },
    allOf: Array.from({ length: n }, () => ({
      controls: { active: './enabled', disabled: './enabled' },
      properties: { target: { type: 'string' } },
    })),
  };
  const root = fieldNodeFactory(blueprint(schema), {
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,
    latentRaw: new PathKeyedMap('pair'),
    misfitPaths: new PathKeyedSet(),
    inactiveValuesMemo: new PathKeyedMap<
      readonly { path: string; value: unknown }[]
    >('path'),
  });
  if (!isTestFieldNode(root)) throw new Error('Missing runtime record');
  const rootRecord: TestFieldNode = root;
  loadFieldNodeAtMount(
    rootRecord,
    { enabled: false, target: 'retained' },
    SetValueOption.Overwrite,
  );
  const enabled = root.find('/enabled');
  if (!enabled) throw new Error('Missing fragment toggle');
  const samplesMs: number[] = [];
  for (let index = -warmups; index < samples; index++) {
    enabled.setValue(false);
    const before = root.structure?.target;
    if (!before || before.disabled)
      throw new Error(`P-08 reset did not remove fragment controls at F=${n}`);
    const start = performance.now();
    enabled.setValue(true);
    const elapsed = performance.now() - start;
    const target = root.structure?.target;
    if (!target) throw new Error('Missing state-key target');
    const layers = getControlLayers(target, new Map());
    if (
      enabled.value !== true ||
      target.emit !== 'retained' ||
      !target.disabled ||
      root.children?.length !== 2 ||
      layers.filter((group) => group.layer === 'fragment').length !== n
    )
      throw new Error(`P-08 expected ${n} selected, combined fragment layers`);
    if (index >= 0) samplesMs.push(elapsed);
  }
  const sorted = [...samplesMs].sort((a, b) => a - b);
  return {
    n,
    medianMs: quantile(sorted, 0.5),
    p10Ms: quantile(sorted, 0.1),
    p90Ms: quantile(sorted, 0.9),
    meanMs: samplesMs.reduce((sum, ms) => sum + ms, 0) / samples,
    samplesMs,
  };
});

console.log(
  JSON.stringify({
    probe: 'fragment-toggle',
    engine,
    ledgerRow: 'P-08',
    runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
    version: Reflect.get(globalThis, 'Bun')
      ? process.versions.bun
      : process.version,
    nodeEnv: process.env.NODE_ENV ?? 'unset',
    warmups,
    samples,
    sizes,
    ratios: sizes.slice(1).map((row, index) => ({
      from: sizes[index].n,
      to: row.n,
      medianRatio: row.medianMs / sizes[index].medianMs,
    })),
  }),
);
