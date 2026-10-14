import { describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { loadFieldNodeAtMount } from '../utils/load/loadFieldNodeAtMount';
import { readFieldNodeDefaultValue } from '../utils/load/readFieldNodeDefaultValue';
import { resetFieldNodeSubtree } from '../utils/load/resetFieldNodeSubtree';
import { createTestTree } from './fixtures/createTestTree';

describe('settle load snapshot', () => {
  it('WRITE-085 preserves the root default snapshot on an equal subtree reset', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        left: { type: 'object', properties: { a: { type: 'string' } } },
        right: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { left: { a: 'A' }, right: 'R' },
      WriteOption.Overwrite,
    );
    const defaultValue = readFieldNodeDefaultValue(root);
    const snapshot = root.runtime.loadSnapshot;
    resetFieldNodeSubtree(root.structure!.left, WriteOption.Overwrite);
    expect(root.runtime.loadSnapshot).toBe(snapshot);
    expect(readFieldNodeDefaultValue(root)).toBe(defaultValue);
  });
});
