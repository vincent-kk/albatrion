import { getJSONPointer } from '@winglet/json/pointer-common';
import { describe, expect, it } from 'vitest';

import {
  convertJSONPathToPointer,
  convertJSONPointerToPath,
  getJSONPath,
  getValue,
} from '../index';

describe('round-2 json 5: empty token round trips', () => {
  it.each(['object', 'array'])(
    'retains the root empty token before an %s',
    (kind) => {
      const leaf = { value: 1 };
      const doc = { '': kind === 'object' ? { x: leaf } : [leaf] };
      const pointer = getJSONPointer(doc, leaf);
      expect(pointer).not.toBeNull();
      expect(getValue(doc, pointer ?? '')).toBe(leaf);
    },
  );
});

it('can represent an empty member by adjacent dots in a JSON path', () => {
  const leaf = { value: 1 };
  expect(getJSONPath({ '': { x: leaf } }, leaf)).toBe('$..x');
});

it('maps numeric and bracket-named members to the same data-path string', () => {
  const numeric = convertJSONPointerToPath('/0');
  const bracketName = convertJSONPointerToPath('/[0]');
  expect(numeric).toBe(bracketName);
  expect(convertJSONPathToPointer(bracketName)).toBe('/0');
});
