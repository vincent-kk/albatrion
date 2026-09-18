// filid:contract graph-primitives
import { describe, expect, it } from 'vitest';

import { parseGraph } from '../parseGraph';
import { stringifyGraph } from '../stringifyGraph';

describe('graph primitives', () => {
  it('preserves scalar values and special numbers', () => {
    for (const value of [
      null,
      undefined,
      true,
      false,
      0,
      -0,
      NaN,
      Infinity,
      -Infinity,
      1n,
      -12n,
      '',
      '한글😀\u0000"\\\ud800',
    ])
      expect(Object.is(parseGraph(stringifyGraph(value)), value)).toBe(true);
  });
  it('rejects executable and unsupported values', () => {
    for (const value of [
      () => 1,
      Symbol(),
      new WeakMap(),
      Promise.resolve(),
      new Uint8Array(1),
      new (class {})(),
    ])
      expect(() => stringifyGraph(value)).toThrow(TypeError);
  });
});
