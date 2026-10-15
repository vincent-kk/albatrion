/**
 * Loaded directly by tsx/Bun; follows 06-array/performance.md, 51C-01:
 * the P-03 table row (string siblings active: '../flag', first object load)
 * and its paragraph excluding blueprint/tree/input creation from timing.
 * Full runs use that record's 30 warmups and the standalone bench's 100 samples.
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
  distSha256,
} = await loadDistEngine();
const engine = { source: 'dist', distSha256 };

const smoke = process.argv.includes('--smoke');
const warmups = smoke ? 2 : 30;
const samples = smoke ? 3 : 100;

/** Return an interpolated quantile of a nonempty sorted timing array. */
function quantile(sorted: number[], p: number): number {
  const at = (sorted.length - 1) * p;
  const low = Math.floor(at);
  return sorted[low] + (sorted[Math.ceil(at)] - sorted[low]) * (at - low);
}

const sizes = (smoke ? [1000] : [1000, 2000, 4000, 8000]).map((n) => {
  const properties: Record<string, unknown> = { flag: { type: 'boolean' } };
  const value: Record<string, unknown> = { flag: true };
  for (let index = 0; index < n; index++) {
    properties[`g${index}`] = {
      type: 'string',
      controls: { active: '../flag' },
    };
    value[`g${index}`] = String(index);
  }
  const schema: BlueprintSchema = { type: 'object', properties };
  const analysis = blueprint(schema);
  const samplesMs: number[] = [];
  for (let index = -warmups; index < samples; index++) {
    const root = fieldNodeFactory(analysis, {
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
    const start = performance.now();
    loadFieldNodeAtMount(rootRecord, value, SetValueOption.Overwrite);
    const elapsed = performance.now() - start;
    if (root.children?.length !== n + 1 || root.structure?.flag.emit !== true)
      throw new Error(`P-03 node count or flag mismatch at N=${n}`);
    for (let child = 0; child < n; child++)
      if (root.structure?.[`g${child}`].emit !== String(child))
        throw new Error(`P-03 missing committed sibling ${child}`);
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
    probe: 'gate-siblings',
    engine,
    ledgerRow: 'P-03 (R-17)',
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
