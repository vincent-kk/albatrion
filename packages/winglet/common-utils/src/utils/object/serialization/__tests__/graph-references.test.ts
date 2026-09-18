// filid:contract graph-references
import { expect, it } from 'vitest';

import { parseGraph } from '../parseGraph';
import { stringifyGraph } from '../stringifyGraph';

it('preserves cycles and shared builtin identities', () => {
  const value: any = {
    date: new Date(1),
    map: new Map(),
    set: new Set(),
    re: /x/,
  };
  value.self = value;
  value.other = { parent: value };
  value.again = value.date;
  value.map.set(value.date, value);
  value.set.add(value.set);
  value.re.lastIndex = value;
  const result: any = parseGraph(stringifyGraph(value));
  expect(result.self).toBe(result);
  expect(result.other.parent).toBe(result);
  expect(result.again).toBe(result.date);
  expect(result.map.get(result.date)).toBe(result);
  expect(result.set.has(result.set)).toBe(true);
  expect(result.re.lastIndex).toBe(result);
});
it('handles deep graphs without recursive stack exhaustion', () => {
  let value: any = {};
  for (let i = 0; i < 10000; i++) value = { next: value };
  expect(() => parseGraph(stringifyGraph(value))).not.toThrow();
});
