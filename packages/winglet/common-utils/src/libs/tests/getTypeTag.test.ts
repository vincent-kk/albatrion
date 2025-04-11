import { describe, expect, it } from 'vitest';

import { NULL_TAG, UNDEFINED_TAG } from '@/common-utils/constant/typeTag';

import { getTypeTag } from '../getTypeTag';

describe('getTypeTag', () => {
  it('should return NULL_TAG for null value', () => {
    expect(getTypeTag(null)).toBe(NULL_TAG);
  });

  it('should return UNDEFINED_TAG for undefined value', () => {
    expect(getTypeTag(undefined)).toBe(UNDEFINED_TAG);
  });

  it('should return correct type tag for primitive values', () => {
    expect(getTypeTag(42)).toBe('[object Number]');
    expect(getTypeTag('test')).toBe('[object String]');
    expect(getTypeTag(true)).toBe('[object Boolean]');
    expect(getTypeTag(Symbol('test'))).toBe('[object Symbol]');
  });

  it('should return correct type tag for objects', () => {
    expect(getTypeTag({})).toBe('[object Object]');
    expect(getTypeTag([])).toBe('[object Array]');
    expect(getTypeTag(new Date())).toBe('[object Date]');
    expect(getTypeTag(new RegExp('test'))).toBe('[object RegExp]');
    expect(getTypeTag(new Map())).toBe('[object Map]');
    expect(getTypeTag(new Set())).toBe('[object Set]');
  });

  it('should return correct type tag for functions', () => {
    expect(getTypeTag(() => {})).toBe('[object Function]');
    expect(getTypeTag(function () {})).toBe('[object Function]');
    expect(getTypeTag(async function () {})).toBe('[object AsyncFunction]');
  });
});
