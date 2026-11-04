import { afterEach, expect, it, vi } from 'vitest';

import {
  dispatchClear,
  dispatchInsert,
  dispatchMount,
  dispatchPop,
  dispatchPush,
  dispatchRemove,
  dispatchResetForm,
  dispatchSetValue,
  dispatchUpdate,
} from '@/schema-form/core/engine/write';
import * as pointers from '@/schema-form/helpers/jsonPointer';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import * as values from '../../utils/compute/sameValue';
import * as readers from '../utils/loadValues/readFieldNodeIsDivergent';
import * as settlement from '../utils/settlement/finishSettlement';

/** Read a required fixture child without assuming its structure exists. */
const getDispatchChild = (
  node: ReturnType<typeof createDispatchTree>['root'],
  name: string,
) => {
  const child = node.structure?.[name];
  if (!child) throw new Error('Missing fixture child ' + name);
  return child;
};

afterEach(() => vi.restoreAllMocks());

/** Mount the engine fixture and retain its committed runtime for direct reader checks. */
const mount = (
  schema: Parameters<typeof createDispatchTree>[0],
  value: unknown,
) => {
  const tree = createDispatchTree(schema, value);
  dispatchMount(tree.root, value);
  return tree;
};

it('writes never call the divergence reader', () => {
  const { root } = mount(
    { type: 'array', items: { type: 'string', default: 'filled' } },
    ['a'],
  );
  const reader = vi.spyOn(readers, 'readFieldNodeIsDivergent');
  dispatchSetValue(root, ['a', 'b']);
  dispatchPush(root);
  dispatchUpdate(root, 0, 'c');
  dispatchInsert(root, 0, 'd');
  dispatchRemove(root, 0);
  dispatchPop(root);
  dispatchClear(root);
  expect(reader).toHaveBeenCalledTimes(0);
});

it('a flat 2,000-field first read compares once with at most 2,000 baseline property reads', () => {
  const properties = Object.fromEntries(
    Array.from({ length: 2000 }, (_, i) => ['f' + i, { type: 'string' }]),
  );
  const input = Object.fromEntries(
    Array.from({ length: 2000 }, (_, i) => ['f' + i, 'v' + i]),
  );
  const { root, runtime } = mount({ type: 'object', properties }, input);
  const baseline = runtime.loadBaseline?.value;
  dispatchSetValue(getDispatchChild(root, 'f1999'), 'edited');
  const compare = vi.spyOn(values, 'sameValue');
  const get = Reflect.get;
  let reads = 0;
  vi.spyOn(Reflect, 'get').mockImplementation((...args) => {
    if (args[0] === baseline) reads++;
    return get(...args);
  });
  const result = readers.readFieldNodeIsDivergent(root);
  vi.mocked(Reflect.get).mockRestore();
  expect(result).toBe(true);
  expect(compare).toHaveBeenCalledTimes(1);
  expect(reads).toBeLessThanOrEqual(2000);
});

it('an unchanged repeated read and a NaN field call sameValue zero times', () => {
  const { root, runtime } = mount(
    {
      type: 'object',
      properties: { s: { type: 'string' }, n: { type: 'number' } },
    },
    { s: 'loaded', n: NaN },
  );
  expect(runtime.loadBaseline).toEqual({ value: { s: 'loaded', n: NaN } });
  const initialCompare = vi.spyOn(values, 'sameValue');
  expect(readers.readFieldNodeIsDivergent(getDispatchChild(root, 'n'))).toBe(
    false,
  );
  expect(initialCompare).toHaveBeenCalledTimes(1);
  initialCompare.mockRestore();
  dispatchSetValue(getDispatchChild(root, 's'), 'edited');
  expect(readers.readFieldNodeIsDivergent(getDispatchChild(root, 's'))).toBe(
    true,
  );
  expect(readers.readFieldNodeIsDivergent(getDispatchChild(root, 'n'))).toBe(
    false,
  );
  const compare = vi.spyOn(values, 'sameValue');
  expect(readers.readFieldNodeIsDivergent(getDispatchChild(root, 's'))).toBe(
    true,
  );
  expect(readers.readFieldNodeIsDivergent(getDispatchChild(root, 'n'))).toBe(
    false,
  );
  expect(compare).toHaveBeenCalledTimes(0);
});

it('a load that throws before commit keeps the preceding baseline', () => {
  const { root, runtime } = mount({ type: 'string' }, 'loaded');
  dispatchSetValue(root, 'edited');
  const baseline = runtime.loadBaseline;
  expect(baseline).toBeDefined();
  vi.spyOn(settlement, 'finishSettlement').mockImplementationOnce(() => {
    throw new Error('before commit');
  });
  expect(() => dispatchResetForm(root, 'failed load')).toThrow('before commit');
  expect(runtime.loadBaseline).toBe(baseline);
});

it('a nested 200-by-10 edit and restore retains unchanged baseline branches', () => {
  const leaves = Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => ['k' + i, { type: 'string' }]),
  );
  const properties = Object.fromEntries(
    Array.from({ length: 200 }, (_, i) => [
      'g' + i,
      { type: 'object', properties: leaves },
    ]),
  );
  const input = Object.fromEntries(
    Array.from({ length: 200 }, (_, i) => [
      'g' + i,
      Object.fromEntries(Array.from({ length: 10 }, (_, k) => ['k' + k, 'v'])),
    ]),
  );
  const { root, runtime } = mount({ type: 'object', properties }, input);
  const baseline = runtime.loadBaseline?.value;
  const targets: unknown[] = [baseline, ...Object.values(Object(baseline))];
  const leaf = getDispatchChild(getDispatchChild(root, 'g199'), 'k9');
  dispatchSetValue(leaf, 'edited');
  dispatchSetValue(leaf, 'v');
  const compare = vi.spyOn(values, 'sameValue');
  const get = Reflect.get;
  let reads = 0;
  vi.spyOn(Reflect, 'get').mockImplementation((...args) => {
    if (targets.includes(args[0])) reads++;
    return get(...args);
  });
  const result = readers.readFieldNodeIsDivergent(root);
  vi.mocked(Reflect.get).mockRestore();
  expect(result).toBe(false);
  expect(compare).toHaveBeenCalledTimes(1);
  expect(reads).toBeLessThanOrEqual(210);
});

it('a second sweep of 320 branchless nodes parses no pointer segments', () => {
  const properties = Object.fromEntries(
    Array.from({ length: 320 }, (_, i) => ['f' + i, { type: 'string' }]),
  );
  const input = Object.fromEntries(
    Array.from({ length: 320 }, (_, i) => ['f' + i, 'v']),
  );
  const { root, runtime } = mount({ type: 'object', properties }, input);
  expect(runtime.blueprint.capabilities.branchless).toBe(true);
  const nodes = root.children ?? [];
  expect(nodes).toHaveLength(320);
  const parse = vi.spyOn(pointers, 'parsePointerSegments');
  const first = nodes.map(readers.readFieldNodeIsDivergent);
  expect(parse.mock.calls.length).toBeGreaterThan(0);
  parse.mockClear();
  expect(nodes.map(readers.readFieldNodeIsDivergent)).toEqual(first);
  expect(parse).toHaveBeenCalledTimes(0);
});
