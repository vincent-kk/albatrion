import { describe, expect, it } from 'vitest';

import { getValue } from '../../manipulator/getValue';
import { getJSONPointer } from '../getJSONPointer';

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
