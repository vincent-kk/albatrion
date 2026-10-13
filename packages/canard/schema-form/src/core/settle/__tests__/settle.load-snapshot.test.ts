import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import {
  loadFieldNodeAtMount,
  readFieldNodeDefaultValue,
  resetFieldNodeSubtree,
} from '../index';
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
      SetValueOption.Overwrite,
    );
    const defaultValue = readFieldNodeDefaultValue(root);
    const snapshot = root.runtime.loadSnapshot;
    resetFieldNodeSubtree(root.structure!.left, SetValueOption.Overwrite);
    expect(root.runtime.loadSnapshot).toBe(snapshot);
    expect(readFieldNodeDefaultValue(root)).toBe(defaultValue);
  });
});
