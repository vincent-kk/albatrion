import { describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { readFieldNodeDefaultValue } from '../utils/loadValues/readFieldNodeDefaultValue';
import { resetFieldNodeSubtree } from '../utils/reset/resetFieldNodeSubtree';

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
