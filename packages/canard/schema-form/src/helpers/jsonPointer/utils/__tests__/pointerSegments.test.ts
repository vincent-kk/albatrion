import { afterEach, describe, expect, it, vi } from 'vitest';

import { PointerOperator } from '../../constants/PointerOperator';
import { isAbsolutePointer } from '../isAbsolutePointer';
import * as pointerResult from '../parsePointer';
import { parsePointerSegments } from '../parsePointerSegments';

afterEach(() => vi.restoreAllMocks());

describe('segment-only pointer grammar', () => {
  it.each([
    ['*', PointerOperator.Wildcard],
    ['..', PointerOperator.Parent],
    ['.', PointerOperator.Current],
    ['@', PointerOperator.Context],
  ] as const)('keeps %s as an operator', (token, operator) => {
    expect(parsePointerSegments(token)).toEqual([operator]);
  });

  it.each([
    ['%2A', '*'],
    ['%2E%2E', '..'],
    ['%2E', '.'],
    ['%40', '@'],
  ] as const)('keeps %s as a literal name', (token, name) => {
    expect(parsePointerSegments(token)).toEqual([name]);
  });

  it('preserves root and fragment prefixes with the complete-pointer predicate', () => {
    expect(parsePointerSegments('')).toEqual([]);
    expect(parsePointerSegments('#')).toEqual([]);
    expect(parsePointerSegments('/')).toEqual(['']);
    expect(parsePointerSegments('#/')).toEqual(['']);
    expect(isAbsolutePointer('')).toBe(false);
    expect(isAbsolutePointer('#')).toBe(true);
    expect(isAbsolutePointer('/')).toBe(true);
    expect(isAbsolutePointer('#/')).toBe(true);
    expect(isAbsolutePointer('#name')).toBe(false);
    expect(isAbsolutePointer(['#', 'name'])).toBe(true);
    expect(isAbsolutePointer(['name'])).toBe(false);
    expect(isAbsolutePointer([])).toBe(false);
    expect(isAbsolutePointer(['#'])).toBe(true);
    expect(isAbsolutePointer(['/name'])).toBe(false);
    expect(isAbsolutePointer(['#/name'])).toBe(false);
    expect(isAbsolutePointer(['name', '#'])).toBe(false);
    expect(isAbsolutePointer('#name/child')).toBe(false);
    const relative = pointerResult.parsePointer('');
    const absolute = pointerResult.parsePointer('#');
    expect(pointerResult.parsePointer('')).toBe(relative);
    expect(pointerResult.parsePointer('#')).toBe(absolute);
    expect(Object.isFrozen(relative)).toBe(true);
    expect(Object.isFrozen(absolute.segments)).toBe(true);
  });

  it('reuses an ordinary relative array including ordinary percent names', () => {
    const segments = Object.freeze(['name', 'rate%20', '#', '%2a']);
    expect(parsePointerSegments(segments)).toBe(segments);
  });

  it('copies transformed arrays without modifying the caller', () => {
    const segments = Object.freeze(['%2A', '~1']);
    expect(parsePointerSegments(segments)).toEqual(['*', '/']);
    expect(segments).toEqual(['%2A', '~1']);
  });

  it('removes only the leading array fragment', () => {
    const segments = Object.freeze(['#', 'name', '#']);
    expect(parsePointerSegments(segments)).toEqual(['name', '#']);
    expect(segments).toEqual(['#', 'name', '#']);
    const transformed = Object.freeze(['#', '%2A', 'a~1b', '*']);
    expect(parsePointerSegments(transformed)).toEqual([
      '*',
      'a/b',
      PointerOperator.Wildcard,
    ]);
    expect(transformed).toEqual(['#', '%2A', 'a~1b', '*']);
  });

  it('decodes tilde names and preserves ordinary percent strings', () => {
    expect(parsePointerSegments('/a~1b/~0/rate%20')).toEqual([
      'a/b',
      '~',
      'rate%20',
    ]);
  });

  it('returns the array without invoking the cold result wrapper', () => {
    const wrapper = vi.spyOn(pointerResult, 'parsePointer');
    const segments = parsePointerSegments('/name');
    expect(Array.isArray(segments)).toBe(true);
    expect(segments).toEqual(['name']);
    expect(wrapper).not.toHaveBeenCalled();
    pointerResult.parsePointer('/positive-control');
    expect(wrapper).toHaveBeenCalledTimes(1);
  });
});
