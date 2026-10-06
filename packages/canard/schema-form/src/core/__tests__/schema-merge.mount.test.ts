import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import type { mergeEffectiveSchema } from '../blueprint/utils/effectiveSchema/mergeEffectiveSchema';
import type { mergeSchemaContributions } from '../blueprint/utils/effectiveSchema/utils/mergeSchemaContributions';
import { nodeFromJSONSchema } from '../nodeFromJSONSchema';
import { captureBranchlessNodeTree } from './fixtures/captureBranchlessNodeTree';

const counts = vi.hoisted(() => ({ runtime: 0, static: 0, fallback: false, memo: new WeakMap() }));
vi.mock('../blueprint/utils/effectiveSchema/utils/mergeSchemaContributions', async (original) => {
  const actual = await original<{ mergeSchemaContributions: typeof mergeSchemaContributions }>();
  return { mergeSchemaContributions: (...args: Parameters<typeof mergeSchemaContributions>) => {
    counts[args[2].mode === 'static' ? 'static' : 'runtime']++;
    return actual.mergeSchemaContributions(...args);
  } };
});
vi.mock('../blueprint/utils/effectiveSchema/mergeEffectiveSchema', async (original) => {
  const actual = await original<{ mergeEffectiveSchema: typeof mergeEffectiveSchema }>();
  return { mergeEffectiveSchema: (...args: Parameters<typeof mergeEffectiveSchema>) => {
    if (counts.fallback && args[2]?.mode !== 'static') args[3] = counts.memo;
    return actual.mergeEffectiveSchema(...args);
  } };
});
beforeEach(() => { counts.runtime = 0; counts.static = 0; counts.fallback = false; counts.memo = new WeakMap(); });
afterEach(() => { counts.fallback = false; });

// filid:contract schema-merge-mount
it('removes runtime remerges per cold mount while retaining every static check', () => {
  const schema = { type: 'object', properties: { text: { type: 'string', default: 'a' },
    number: { type: 'number', default: 2 }, flag: { type: 'boolean', default: true } } } as const;
  counts.fallback = true;
  const oracle = nodeFromJSONSchema({ jsonSchema: schema, validationMode: 0 });
  const before = { runtime: counts.runtime, static: counts.static };
  counts.fallback = false; counts.runtime = 0; counts.static = 0;
  const root = nodeFromJSONSchema({ jsonSchema: structuredClone(schema), validationMode: 0 });
  console.log('SCHEMA_MERGE_COUNTS', JSON.stringify({ before, after: { runtime: counts.runtime, static: counts.static } }));
  expect(before).toEqual({ runtime: 4, static: 4 });
  expect(counts.static).toBe(before.static);
  expect(captureBranchlessNodeTree(root)).toEqual(captureBranchlessNodeTree(oracle));
  expect(counts.runtime).toBe(0);
});

// filid:contract schema-merge-mount
it('preserves node values, schemas, revisions, warning and event order through later writes', async () => {
  const schema = { type: 'object', properties: {
    text: { type: 'string', default: ' a ', options: { trim: true } },
    branch: { type: 'object', properties: { number: { type: 'number', default: 2 } } },
    list: { type: 'array', items: { type: 'string' }, default: ['first', 'second'] },
  } } as const;
  counts.fallback = true;
  const oracle = nodeFromJSONSchema({ jsonSchema: schema, validationMode: 0 });
  counts.fallback = false;
  const root = nodeFromJSONSchema({ jsonSchema: structuredClone(schema), validationMode: 0 });
  await new Promise(resolve => setImmediate(resolve));
  const events: unknown[][] = [[], []];
  const releases = [oracle, root].map((node, index) => node.subscribe(event => {
    events[index].push({ type: event.type, payload: event.payload });
  }));
  for (const [path, value] of [['/text', ' changed '], ['/branch/number', 4], ['/list/0', 'next']] as const) {
    counts.fallback = true; oracle.find(path)!.setValue(value as never);
    counts.fallback = false; root.find(path)!.setValue(value as never);
    await new Promise(resolve => setImmediate(resolve));
    expect(captureBranchlessNodeTree(root)).toEqual(captureBranchlessNodeTree(oracle));
    expect(root.revision()).toEqual(oracle.revision());
    expect(events[1]).toEqual(events[0]);
    expect(root.value).toBe(root.value);
    expect(root.jsonSchema).toBe(root.jsonSchema);
  }
  expect(events[0].length).toBeGreaterThan(0);
  const invalid = { text: 7, branch: { number: 'wrong' }, list: [2, true] };
  counts.fallback = true; oracle.setValue(invalid as never);
  counts.fallback = false; root.setValue(invalid as never);
  await new Promise(resolve => setImmediate(resolve));
  expect(captureBranchlessNodeTree(root)).toEqual(captureBranchlessNodeTree(oracle));
  expect(Reflect.get(root, 'runtime').typeMismatchRecords).toEqual(Reflect.get(oracle, 'runtime').typeMismatchRecords);
  expect(Reflect.get(root, 'runtime').typeMismatchRecords.length).toBeGreaterThan(0);
  expect(events[1]).toEqual(events[0]);
  for (const release of releases) release();
});
