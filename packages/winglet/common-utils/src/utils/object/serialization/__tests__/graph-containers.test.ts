// filid:contract graph-containers
import { describe, expect, it, vi } from 'vitest';

import { parseGraph } from '../parseGraph';
import { stringifyGraph } from '../stringifyGraph';

describe('graph containers', () => {
  it('preserves containers and intrinsic payloads', () => {
    const value = {
      date: new Date(123),
      invalid: new Date(NaN),
      map: new Map([[1, undefined]]),
      set: new Set([2, 1]),
      re: /a+/gi,
    };
    value.re.lastIndex = 4;
    expect(parseGraph(stringifyGraph(value))).toEqual(value);
  });
  it('preserves holes, undefined, extra properties and null prototypes', () => {
    const array = Object.assign(new Array(3), { 1: undefined, extra: 'ok' });
    const result = parseGraph(
      stringifyGraph({
        array,
        null: Object.assign(Object.create(null), { x: 1 }),
      }),
    ) as typeof array & { array: typeof array; null: object };
    expect(0 in result.array).toBe(false);
    expect(1 in result.array).toBe(true);
    expect(result.array.length).toBe(3);
    expect(result.array.extra).toBe('ok');
    expect(Object.getPrototypeOf(result.null)).toBe(null);
  });
  it('rejects accessors without invoking them or toJSON', () => {
    const get = vi.fn();
    expect(() =>
      stringifyGraph(Object.defineProperty({}, 'x', { get, enumerable: true })),
    ).toThrow(TypeError);
    expect(get).not.toHaveBeenCalled();
    expect(() => stringifyGraph({ toJSON: get })).toThrow(TypeError);
    expect(get).not.toHaveBeenCalled();
  });
  it('rejects symbol properties and extra builtin properties', () => {
    expect(() => stringifyGraph({ [Symbol()]: 1 })).toThrow(TypeError);
    expect(() => stringifyGraph(Object.assign(new Date(), { x: 1 }))).toThrow(
      TypeError,
    );
  });
});
