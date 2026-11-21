import { describe, expect, it } from 'vitest';

import { TYPE_MASK, foldAllowedTypes } from '../foldAllowedTypes';

describe('foldAllowedTypes', () => {
  it('maps untyped, empty, and null-only inputs to the null bit', () => {
    expect(foldAllowedTypes(undefined)).toBe(TYPE_MASK.null);
    expect(foldAllowedTypes([])).toBe(TYPE_MASK.null);
    expect(foldAllowedTypes('null')).toBe(TYPE_MASK.null);
    expect(foldAllowedTypes(['null'])).toBe(TYPE_MASK.null);
    expect(foldAllowedTypes(['null', 'null'])).toBe(TYPE_MASK.null);
  });

  it('encodes each scalar type to its bit and folds integer into number', () => {
    expect(foldAllowedTypes('string')).toBe(TYPE_MASK.string);
    expect(foldAllowedTypes('number')).toBe(TYPE_MASK.number);
    expect(foldAllowedTypes('integer')).toBe(TYPE_MASK.number);
    expect(foldAllowedTypes('boolean')).toBe(TYPE_MASK.boolean);
    expect(foldAllowedTypes('object')).toBe(TYPE_MASK.object);
    expect(foldAllowedTypes('array')).toBe(TYPE_MASK.array);
  });

  it('ignores nullable decoration when non-null kinds are present', () => {
    expect(foldAllowedTypes(['string', 'null'])).toBe(TYPE_MASK.string);
    expect(foldAllowedTypes(['null', 'integer'])).toBe(TYPE_MASK.number);
    expect(foldAllowedTypes(['null', 'object', 'null'])).toBe(TYPE_MASK.object);
  });

  it('combines multi-type unions independently of order and duplicates', () => {
    const stringOrNumber = TYPE_MASK.string | TYPE_MASK.number;
    expect(foldAllowedTypes(['string', 'number'])).toBe(stringOrNumber);
    expect(foldAllowedTypes(['number', 'string'])).toBe(stringOrNumber);
    expect(foldAllowedTypes(['integer', 'string', 'null', 'number'])).toBe(
      stringOrNumber,
    );
    expect(foldAllowedTypes(['boolean', 'number', 'string'])).toBe(
      TYPE_MASK.boolean | TYPE_MASK.number | TYPE_MASK.string,
    );
  });
});
