import { describe, expect, it } from 'vitest';

import { merge } from '../index';

// filid:contract explicit-policies
describe('merge options', () => {
  it('reads the array policy once for a deeply nested merge', () => {
    let reads = 0;
    const options = {
      immutable: true,
      get arrayStrategy() {
        reads++;
        return 'merge' as const;
      },
    };
    const target = { items: [[{ values: [1, 2] }]] };
    const source = { items: [[{ values: [3] }]] };
    expect(merge(target, source, options)).toEqual({
      items: [[{ values: [3, 2] }]],
    });
    expect(reads).toBe(1);
    expect(target.items[0][0].values).toEqual([1, 2]);
  });

  it('copies overlapping objects without changing either input', () => {
    const left = { nested: { a: 1 }, untouched: { stable: true } };
    const right = { nested: { b: 2 }, added: { stable: true } };
    const result = merge(left, right, {
      immutable: true,
      preserveReferences: true,
    });
    expect(result).toEqual({
      nested: { a: 1, b: 2 },
      untouched: left.untouched,
      added: right.added,
    });
    expect(result).not.toBe(left);
    expect(result.nested).not.toBe(left.nested);
    expect(result.nested).not.toBe(right.nested);
    expect(result.untouched).toBe(left.untouched);
    expect(result.added).toBe(right.added);
    expect(left.nested).toEqual({ a: 1 });
    expect(right.nested).toEqual({ b: 2 });
  });

  it('replaces arrays with the source reference when requested', () => {
    const source = { values: [3] };
    expect(
      merge({ values: [1, 2] }, source, { arrayStrategy: 'replace' }).values,
    ).toBe(source.values);
  });

  it('does not enumerate opaque source or target objects', () => {
    const atomic = Object.defineProperty({ opaque: true }, 'value', {
      enumerable: true,
      get: () => {
        throw new Error('opaque value inspected');
      },
    });
    const options = {
      immutable: true,
      isAtomic: (value: unknown) => value === atomic,
    };
    expect(
      merge({ value: { old: true } }, { value: atomic }, options).value,
    ).toBe(atomic);
    const source = { value: { next: true } };
    expect(merge({ value: atomic }, source, options).value).toEqual(
      source.value,
    );
  });

  it('preserves source-only references when merging into a mutable target', () => {
    const target = {};
    const value = { nested: [] };
    expect(merge(target, { value }, { preserveReferences: true }).value).toBe(
      value,
    );
    expect(target).toEqual({ value });
  });

  it('does not erase a defined value with undefined', () => {
    expect(
      merge({ value: 1 }, { value: undefined }, { immutable: true }),
    ).toEqual({ value: 1 });
  });

  it('retains legacy mutation and recursive array index behavior without options', () => {
    const target = { values: [{ a: 1 }, 2] };
    expect(merge(target, { values: [{ b: 2 }] })).toBe(target);
    expect(target).toEqual({ values: [{ a: 1, b: 2 }, 2] });
  });

  it('copies nested values when reference preservation is not requested', () => {
    const source = { value: { child: [1] } };
    const result = merge({}, source, { immutable: true });
    expect(result).toEqual(source);
    expect(result.value).not.toBe(source.value);
    expect(result.value.child).not.toBe(source.value.child);
  });

  it('keeps immutable array index merging independent of the target', () => {
    const target = { values: [{ a: 1 }, 2] };
    const result = merge(target, { values: [{ b: 2 }] }, { immutable: true });
    expect(result.values).toEqual([{ a: 1, b: 2 }, 2]);
    expect(target.values).toEqual([{ a: 1 }, 2]);
  });

  it('carries reserved own keys as data without following inherited objects', () => {
    const source = JSON.parse(
      '{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}',
    );
    const result = merge({}, source, {
      immutable: true,
      preserveReferences: true,
    });
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(
      true,
    );
    expect(result.__proto__).toBe(source.__proto__);
    expect(Object.prototype).not.toHaveProperty('polluted');
  });

  it('combines all policies while keeping frozen inputs intact', () => {
    const left = Object.freeze({
      nested: Object.freeze({ a: 1 }),
      values: Object.freeze([1, 2]),
    });
    const right = Object.freeze({
      nested: Object.freeze({ b: 2 }),
      values: Object.freeze([3]),
    });
    const result = merge(left, right, {
      immutable: true,
      preserveReferences: true,
      arrayStrategy: 'replace',
      isAtomic: () => false,
    });
    expect(result.nested).toEqual({ a: 1, b: 2 });
    expect(result.values).toBe(right.values);
  });
});
