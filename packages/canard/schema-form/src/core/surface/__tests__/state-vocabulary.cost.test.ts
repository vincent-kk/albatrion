import { afterEach, expect, it, vi } from 'vitest';

import * as readers from '../../engine/settle';
import * as values from '../../engine/utils/compute/sameValue';
import { requireRuntimeFieldNode } from '../runtime/requireRuntimeFieldNode';
import { makeVocabularyTree } from './fixtures/makeVocabularyTree';

afterEach(() => vi.restoreAllMocks());

it('writes read no baseline and never call the divergence reader', () => {
  const root = makeVocabularyTree(
    { type: 'array', items: { type: 'string', default: 'filled' } },
    ['a'],
  );
  if (root.type !== 'array') throw new Error('Expected array');
  const runtime = requireRuntimeFieldNode(root).runtime;
  let stored: unknown = Reflect.get(runtime, 'loadBaseline');
  let reads = 0;
  Object.defineProperty(runtime, 'loadBaseline', {
    configurable: true,
    get: () => {
      reads++;
      return stored;
    },
    set: (value: unknown) => {
      stored = value;
    },
  });
  const reader = vi.spyOn(readers, 'readFieldNodeIsDivergent');
  root.setValue(['a', 'b']);
  root.push();
  root.update(0, 'c');
  root.insert(0, 'd');
  root.remove(0);
  root.pop();
  root.clear();
  expect(reads).toBe(0);
  expect(reader).toHaveBeenCalledTimes(0);
});

it('a flat 2,000-field first read compares once with at most 2,000 baseline property reads', () => {
  const properties = Object.fromEntries(
    Array.from({ length: 2000 }, (_, index) => [
      'f' + index,
      { type: 'string' },
    ]),
  );
  const input = Object.fromEntries(
    Array.from({ length: 2000 }, (_, index) => ['f' + index, 'v' + index]),
  );
  const root = makeVocabularyTree({ type: 'object', properties }, input);
  const baseline = requireRuntimeFieldNode(root).runtime.loadBaseline?.value;
  root.find('/f1999')?.setValue('edited');
  const compare = vi.spyOn(values, 'sameValue');
  const get = Reflect.get;
  let reads = 0;
  vi.spyOn(Reflect, 'get').mockImplementation((...args) => {
    if (args[0] === baseline) reads++;
    return get(...args);
  });
  expect(root.isDivergent).toBe(true);
  expect(compare).toHaveBeenCalledTimes(1);
  expect(reads).toBeLessThanOrEqual(2000);
});

it('a nested 200-by-10 edit and restore retains unchanged baseline branches', () => {
  const leaves = Object.fromEntries(
    Array.from({ length: 10 }, (_, index) => ['k' + index, { type: 'string' }]),
  );
  const properties = Object.fromEntries(
    Array.from({ length: 200 }, (_, index) => [
      'g' + index,
      { type: 'object', properties: leaves },
    ]),
  );
  const input = Object.fromEntries(
    Array.from({ length: 200 }, (_, index) => [
      'g' + index,
      Object.fromEntries(
        Array.from({ length: 10 }, (_, key) => ['k' + key, 'v']),
      ),
    ]),
  );
  const root = makeVocabularyTree({ type: 'object', properties }, input);
  const baseline = requireRuntimeFieldNode(root).runtime.loadBaseline?.value;
  const targets: unknown[] = [baseline, ...Object.values(Object(baseline))];
  const leaf = root.find('/g199/k9');
  if (!leaf) throw new Error('Missing nested leaf');
  leaf.setValue('edited');
  expect(leaf.value).toBe('edited');
  leaf.setValue('v');
  expect(leaf.value).toBe('v');
  const compare = vi.spyOn(values, 'sameValue');
  const get = Reflect.get;
  let reads = 0;
  vi.spyOn(Reflect, 'get').mockImplementation((...args) => {
    if (targets.includes(args[0])) reads++;
    return get(...args);
  });
  expect(root.isDivergent).toBe(false);
  expect(compare).toHaveBeenCalledTimes(1);
  expect(reads).toBeLessThanOrEqual(210);
});

it('an unchanged repeated read calls sameValue zero times', () => {
  const root = makeVocabularyTree({ type: 'string' }, 'loaded');
  root.setValue('edited');
  expect(root.isDivergent).toBe(true);
  const compare = vi.spyOn(values, 'sameValue');
  expect(root.isDivergent).toBe(true);
  expect(compare).toHaveBeenCalledTimes(0);
});

it('a NaN-valued field hits the repeated-read memo', () => {
  const root = makeVocabularyTree(
    { type: 'object', properties: { n: { type: 'number' } } },
    { n: NaN },
  );
  const node = root.find('/n');
  if (!node) throw new Error('Missing number');
  expect(node.isDivergent).toBe(false);
  const compare = vi.spyOn(values, 'sameValue');
  expect(node.isDivergent).toBe(false);
  expect(compare).toHaveBeenCalledTimes(0);
});
