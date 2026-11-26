import { describe, expect, it } from 'vitest';

import {
  loadFieldNodeAtMount,
  resetFieldNodeForm,
  resetFieldNodeSubtree,
  writeFieldNode,
} from '../settle';
import { FieldNodeWriteKind, WriteOption } from '../types/value';
import { createTestTree } from './fixtures/createTestTree';

const schema = {
  type: 'object',
  properties: {
    count: { type: 'number' },
    doubled: { type: 'number', controls: { derived: '../count * 2' } },
    note: { type: 'string' },
  },
};

const mount = (value: object) => {
  const { root } = createTestTree(schema);
  loadFieldNodeAtMount(root, value, WriteOption.Overwrite);
  return root;
};

describe('derive rule baselines across a form reset', () => {
  it('re-derives an edited target on form reset exactly as on the first load', () => {
    const root = mount({ count: 1 });
    const doubled = root.__childrenByName__!.doubled;
    writeFieldNode(
      doubled,
      10,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(root.__value__).toEqual({ count: 1, doubled: 10 });
    resetFieldNodeForm(root, { count: 1, doubled: 10 }, WriteOption.Overwrite);
    expect(root.__value__).toEqual(mount({ count: 1, doubled: 10 }).__value__);
    expect(root.__value__).toEqual({ count: 1, doubled: 2 });
  });

  it('keeps the rule edge-triggered after a form reset', () => {
    const root = mount({ count: 1 });
    resetFieldNodeForm(root, { count: 3 }, WriteOption.Overwrite);
    const { count, doubled, note } = root.__childrenByName__!;
    writeFieldNode(doubled, 7, FieldNodeWriteKind.Input, WriteOption.Overwrite);
    writeFieldNode(note, 'x', FieldNodeWriteKind.Input, WriteOption.Overwrite);
    expect(root.__value__).toEqual({ count: 3, doubled: 7, note: 'x' });
    writeFieldNode(count, 4, FieldNodeWriteKind.Input, WriteOption.Overwrite);
    expect(root.__value__).toEqual({ count: 4, doubled: 8, note: 'x' });
  });

  it('holds one committed baseline per rule occurrence across repeated resets', () => {
    const root = mount({ count: 1 });
    const sizes: number[] = [];
    for (let index = 0; index < 4; index++) {
      resetFieldNodeForm(root, { count: index }, WriteOption.Overwrite);
      resetFieldNodeSubtree(
        root.__childrenByName__!.note,
        WriteOption.Overwrite,
      );
      sizes.push(root.runtime.committedRuleValues?.size ?? 0);
    }
    expect(sizes[0]).toBeGreaterThan(0);
    expect(sizes).toEqual([sizes[0], sizes[0], sizes[0], sizes[0]]);
    expect(root.runtime.committedRuleKeysBySource?.get('/doubled')?.size).toBe(
      1,
    );
  });
});
