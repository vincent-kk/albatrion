import { afterEach, expect, it, vi } from 'vitest';

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
  root.setValue(['a', 'b']);
  root.push();
  root.update(0, 'c');
  root.insert(0, 'd');
  root.remove(0);
  root.pop();
  root.clear();
  expect(reads).toBe(0);
});
