// filid:contract graph-omit
import { expect, it, vi } from 'vitest';

import { parseGraph } from '../parseGraph';
import { stringifyGraph } from '../stringifyGraph';

it('omits recursively before accessing values and preserves array length', () => {
  const get = vi.fn();
  const value = {
    nested: Object.defineProperty({ keep: 1 }, 'drop', {
      get,
      enumerable: true,
    }),
    array: [1, 2],
  };
  const result: any = parseGraph(
    stringifyGraph(value, { omit: ['drop', '0'] }),
  );
  expect(result.nested).toEqual({ keep: 1 });
  expect(result.array.length).toBe(2);
  expect(0 in result.array).toBe(false);
  expect(get).not.toHaveBeenCalled();
});
it('observes mutable omit collections and preserves collection entries', () => {
  const omit = new Set(['x']);
  const value = { x: 1, y: 2, map: new Map([['x', 3]]) };
  expect(
    (parseGraph(stringifyGraph(value, { omit })) as any).x,
  ).toBeUndefined();
  omit.clear();
  const result: any = parseGraph(stringifyGraph(value, { omit }));
  expect(result.x).toBe(1);
  expect(result.map.get('x')).toBe(3);
});
