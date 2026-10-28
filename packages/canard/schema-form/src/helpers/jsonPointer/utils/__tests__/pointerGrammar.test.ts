import { describe, expect, it } from 'vitest';

import { PointerOperator } from '../../constants/PointerOperator';
import { appendSegment } from '../appendSegment';
import { formatSegment } from '../formatSegment';
import { getChildPointer } from '../getChildPointer';
import { hasPointerOperator } from '../hasPointerOperator';
import { isDescendantPath } from '../isDescendantPath';
import { joinPointer } from '../joinPointer';
import { parsePointer } from '../parsePointer';
import { parsePointerSegment } from '../parsePointerSegment';
import { parseStandardPointer } from '../parseStandardPointer';
import { readPointerSegment } from '../readPointerSegment';
import { rebasePointer } from '../rebasePointer';
import { resolvePointer } from '../resolvePointer';
import { stripFragment } from '../stripFragment';

describe('pointer grammar', () => {
  it('distinguishes operators from their exact percent literal forms', () => {
    expect(parsePointer('*/.././@').segments).toEqual([
      PointerOperator.Wildcard,
      PointerOperator.Parent,
      PointerOperator.Current,
      PointerOperator.Context,
    ]);
    expect(parsePointer('%2A/%2E%2E/%2E/%40').segments).toEqual([
      '*',
      '..',
      '.',
      '@',
    ]);
  });

  it('only decodes tilde escapes for ordinary names', () => {
    expect(parsePointer('a~1b/~01/rate%20/%2a/#').segments).toEqual([
      'a/b',
      '~1',
      'rate%20',
      '%2a',
      '#',
    ]);
  });

  it('preserves prefixes, empty names and the array input shape', () => {
    expect(parsePointer('#')).toEqual({ absolute: true, segments: [] });
    expect(parsePointer('#/')).toEqual({ absolute: true, segments: [''] });
    expect(parsePointer('/')).toEqual({ absolute: true, segments: [''] });
    expect(parsePointer('')).toEqual({ absolute: false, segments: [] });
    expect(parsePointer(['#', '%2A', '*', '#'])).toEqual({
      absolute: true,
      segments: ['*', PointerOperator.Wildcard, '#'],
    });
    const ordinary = ['child', 'rate%20'];
    expect(parsePointer(ordinary).segments).toBe(ordinary);
    const encoded = ['%2A', '*'];
    expect(parsePointer(encoded).segments).toEqual([
      '*',
      PointerOperator.Wildcard,
    ]);
    expect(encoded).toEqual(['%2A', '*']);
  });

  it('round trips reserved and escaped literal names', () => {
    for (const name of ['*', '..', '.', '@', '~', '/', 'rate%20'])
      expect(parsePointer(formatSegment(name)).segments).toEqual([name]);
    expect(formatSegment('rate%20')).toBe('rate%20');
  });

  it('keeps standard pointer reserved names literal', () => {
    expect(parseStandardPointer('/*/.././@/~01')).toEqual([
      '*',
      '..',
      '.',
      '@',
      '~1',
    ]);
    expect(parseStandardPointer('/rate%20')).toEqual(['rate%20']);
    expect(parseStandardPointer('/')).toEqual(['']);
    expect(parseStandardPointer('')).toEqual([]);
  });

  it('percent decodes complete standard fragment segments before tilde escapes', () => {
    expect(parseStandardPointer('#/%2A/a%20b/%7E1/%E2%82%AC')).toEqual([
      '*',
      'a b',
      '/',
      '€',
    ]);
    expect(parseStandardPointer('#')).toEqual([]);
  });

  it('rejects a malformed standard pointer before resolving a reference', () => {
    expect(() => parseStandardPointer('#invalid')).toThrow(
      expect.objectContaining({ specific: 'INVALID_POINTER_TYPE' }),
    );
    expect(() => parseStandardPointer('relative')).toThrow();
  });

  it('builds literal names and operator segments without double escaping', () => {
    expect(appendSegment('/branch', '*')).toBe('/branch/%2A');
    expect(appendSegment('', 'a/b')).toBe('/a~1b');
    expect(joinPointer(['*', PointerOperator.Wildcard, 'rate%20'])).toBe(
      '/%2A/*/rate%20',
    );
  });

  it('tests strict descendants on segment boundaries', () => {
    expect(isDescendantPath('/a/b', '/a')).toBe(true);
    expect(isDescendantPath('/ab', '/a')).toBe(false);
    expect(isDescendantPath('/a', '/a')).toBe(false);
    expect(isDescendantPath('/a', '')).toBe(true);
    expect(isDescendantPath('', '')).toBe(false);
  });

  it('resolves relative steps and keeps literal reserved names distinct', () => {
    expect(resolvePointer('/a/b', '../%2A')).toBe('/a/%2A');
    expect(resolvePointer('/a/b', './child')).toBe('/a/b/child');
    expect(resolvePointer('/a', '../../../child')).toBe('/child');
    expect(resolvePointer('/a', '#/branch/%2A')).toBe('/branch/%2A');
    expect(resolvePointer('/a', '@')).toBe('@');
    expect(resolvePointer('/a', '/')).toBe('/');
  });

  it('reads one segment without losing literal or operator identity', () => {
    expect(readPointerSegment('/branch/%2A/0', 1)).toBe('*');
    expect(readPointerSegment('/branch/%2A/0', -2)).toBe('*');
    expect(readPointerSegment('/branch/*', -1)).toBe(PointerOperator.Wildcard);
    expect(readPointerSegment('/branch', 1)).toBeUndefined();
    expect(readPointerSegment('/branch', -2)).toBeUndefined();
  });

  it('extracts direct child addresses and rebases their encoded suffix', () => {
    expect(getChildPointer('/a/1/%2A', '/a')).toBe('/a/1');
    expect(getChildPointer('/a/1', '/a')).toBe('/a/1');
    expect(getChildPointer('/ab/1', '/a')).toBeUndefined();
    expect(rebasePointer('/a/1/%2A', '/a/1', '/a/0')).toBe('/a/0/%2A');
  });

  it('detects only exact operator segments without interpreting literal encodings', () => {
    expect(hasPointerOperator('/a/*/b', PointerOperator.Wildcard)).toBe(true);
    expect(hasPointerOperator('/a/*x/%2A', PointerOperator.Wildcard)).toBe(
      false,
    );
    expect(hasPointerOperator('/a/../b', PointerOperator.Parent)).toBe(true);
    expect(hasPointerOperator('/a/.../b', PointerOperator.Current)).toBe(false);
  });

  it('preserves empty and hash names when the input is already one segment', () => {
    expect(parsePointerSegment('')).toBe('');
    expect(parsePointerSegment('#')).toBe('#');
    expect(parsePointerSegment('%2A')).toBe('*');
    expect(parsePointerSegment('*')).toBe(PointerOperator.Wildcard);
  });

  it('preserves empty names and the absolute root marker for dependencies', () => {
    expect(stripFragment('#/', false)).toBe('/');
    expect(stripFragment('/', false)).toBe('/');
    expect(stripFragment('#/')).toBe('/');
    expect(resolvePointer('/host', stripFragment('#/', false))).toBe('/');
    expect(stripFragment('#', true)).toBe('#');
    expect(resolvePointer('/host', stripFragment('#', true))).toBe('');
    expect(resolvePointer('/', 'child')).toBe('//child');
    expect(resolvePointer('/host', '/')).toBe('/');
    expect(resolvePointer('/host', '')).toBe('/host');
  });
});
