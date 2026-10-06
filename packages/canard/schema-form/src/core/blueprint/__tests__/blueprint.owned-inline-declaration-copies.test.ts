import { expect, it, vi } from 'vitest';

import { blueprint } from '../blueprint';

/** The existing collection boundary identifies invocation-owned input arrays. */
const work = vi.hoisted(() => ({ inputs: new WeakSet<object>(), iterations: 0 }));

vi.mock('../utils/analyze/collectDeclarations', async (importOriginal) => {
  const original = await importOriginal<typeof import('../utils/analyze/collectDeclarations')>();
  return {
    collectDeclarations: (...args: Parameters<typeof original.collectDeclarations>) => {
      work.inputs.add(args[1].gates);
      work.inputs.add(args[1].order);
      return original.collectDeclarations(...args);
    },
  };
});

it('copies packed input memberships without invoking their iterators', () => {
  work.inputs = new WeakSet();
  work.iterations = 0;
  const iterator = Array.prototype[Symbol.iterator];
  Array.prototype[Symbol.iterator] = function () {
    if (work.inputs.has(this)) work.iterations++;
    return iterator.call(this);
  };
  let result;
  try {
    result = blueprint({ type: 'object', properties: { first: { type: 'string' }, second: { type: 'number' } } });
  } finally {
    Array.prototype[Symbol.iterator] = iterator;
  }
  expect(work.iterations).toBe(0);
  expect(result.fragments).toHaveLength(3);
  for (const node of result.nodes) {
    const declaration = node.declarations[0];
    const fragment = result.fragments[declaration.fragmentId];
    expect(declaration.gates).not.toBe(fragment.gates);
    expect(declaration.order).not.toBe(fragment.order);
    expect(declaration.gates).toEqual(fragment.gates);
    expect(declaration.order).toEqual(fragment.order);
    expect(Object.isFrozen(declaration.gates)).toBe(process.env.NODE_ENV !== 'production');
  }
});
