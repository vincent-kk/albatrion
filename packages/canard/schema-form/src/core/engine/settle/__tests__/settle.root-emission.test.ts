import { describe, expect, it } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import {
  FieldNodeWriteKind,
  WriteOption,
} from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

const trimmedStrings = (terminal: boolean): BlueprintSchema => ({
  type: 'array',
  items: { type: 'string' },
  options: { omitTrailingEmpty: true, terminal },
});

// filid:contract settle-root-emission
describe('a root object or array never omits itself', () => {
  it.each([false, true])(
    'settle-root-emission emits [] when terminal=%s trims every item at mount',
    (terminal) => {
      const { root } = createTestTree(trimmedStrings(terminal));
      loadFieldNodeAtMount(root, ['', null], WriteOption.Overwrite);
      expect(root.emit).toEqual([]);
    },
  );

  it.each([false, true])(
    'settle-root-emission emits [] when terminal=%s trims every item after a write',
    (terminal) => {
      const { root } = createTestTree(trimmedStrings(terminal));
      loadFieldNodeAtMount(root, ['a'], WriteOption.Overwrite);
      writeFieldNode(
        root,
        ['', null],
        FieldNodeWriteKind.Load,
        WriteOption.Overwrite,
      );
      expect(root.emit).toEqual([]);
    },
  );

  it('settle-root-emission keeps the empty local of a root object and array', () => {
    const object = createTestTree({
      type: 'object',
      properties: { name: { type: 'string' } },
    }).root;
    loadFieldNodeAtMount(object, { name: '' }, WriteOption.Overwrite);
    expect(object.emit).toEqual({});

    const array = createTestTree(trimmedStrings(false)).root;
    loadFieldNodeAtMount(array, [], WriteOption.Overwrite);
    expect(array.emit).toBe(array.local);
  });
});
