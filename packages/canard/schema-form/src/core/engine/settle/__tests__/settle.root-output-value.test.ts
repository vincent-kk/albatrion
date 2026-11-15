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

// filid:contract settle-root-output-value
describe('a root object or array never omits itself', () => {
  it.each([false, true])(
    'settle-root-output-value outputs [] when terminal=%s trims every item at mount',
    (terminal) => {
      const { root } = createTestTree(trimmedStrings(terminal));
      loadFieldNodeAtMount(root, ['', null], WriteOption.Overwrite);
      expect(root.storedOutputValue).toEqual([]);
    },
  );

  it.each([false, true])(
    'settle-root-output-value outputs [] when terminal=%s trims every item after a write',
    (terminal) => {
      const { root } = createTestTree(trimmedStrings(terminal));
      loadFieldNodeAtMount(root, ['a'], WriteOption.Overwrite);
      writeFieldNode(
        root,
        ['', null],
        FieldNodeWriteKind.Load,
        WriteOption.Overwrite,
      );
      expect(root.storedOutputValue).toEqual([]);
    },
  );

  it('settle-root-output-value outputs [] when a literal default trims every item on the static first load', () => {
    const { root } = createTestTree({
      type: 'array',
      items: { type: 'string' },
      default: ['', null],
      options: { omitTrailingEmpty: true },
    });
    loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
    expect(root.children).toHaveLength(2);
    expect(root.storedOutputValue).toEqual([]);
  });

  it('settle-root-output-value keeps the empty stored value of a root object and array', () => {
    const object = createTestTree({
      type: 'object',
      properties: { name: { type: 'string' } },
    }).root;
    loadFieldNodeAtMount(object, { name: '' }, WriteOption.Overwrite);
    expect(object.storedOutputValue).toEqual({});
    expect(object.storedOutputValue).toBe(object.storedValue);

    const array = createTestTree(trimmedStrings(false)).root;
    loadFieldNodeAtMount(array, [], WriteOption.Overwrite);
    expect(array.storedOutputValue).toBe(array.storedValue);
  });
});
