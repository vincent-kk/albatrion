import { expect, it } from 'vitest';

import { getFieldPartId } from '../getFieldPartId';

it('keeps every repeated part separate from consumer part names and keys', () => {
  const parts = ['option', 'option1', 'option:1', 'option~5n1', '', '~2', 'a b', 'a/b', 'a:b'];
  const indices = [undefined, 0, 1, '', '0', '1', '~2', 'a b', 'a/b', 'a:b'];
  const ids = parts.flatMap(part => indices.map(index => getFieldPartId('scope:/a~02:b', part, index)));
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids.every(id => id.split('~2').length === 2 && !/\s/.test(id))).toBe(true);
});

it.each([-1, 0.5, NaN, Infinity])('rejects invalid numeric repeated index %s', index => {
  expect(() => getFieldPartId('scope:/a', 'option', index)).toThrow(RangeError);
});
