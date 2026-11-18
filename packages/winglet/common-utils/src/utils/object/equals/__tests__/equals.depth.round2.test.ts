import { describe, expect, it } from 'vitest';

import { equals } from '../equals';

describe('round-2 json 7: equality depth equivalence', () => {
  it.each(['object', 'array'])(
    'compares a deep %s like its shallow leaf',
    (kind) => {
      const nest = (leaf: unknown) => {
        for (let depth = 0; depth < 10000; depth++)
          leaf = kind === 'object' ? { child: leaf } : [leaf];
        return leaf;
      };
      expect(equals(nest({ value: 1 }), nest({ value: 1 }))).toBe(
        equals({ value: 1 }, { value: 1 }),
      );
      expect(equals(nest({ value: 1 }), nest({ value: 2 }))).toBe(
        equals({ value: 1 }, { value: 2 }),
      );
    },
  );
});
