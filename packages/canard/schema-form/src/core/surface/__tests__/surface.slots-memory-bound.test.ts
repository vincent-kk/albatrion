import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { FieldNode } from '../runtime/FieldNode';
import { countRetainedSlotNodes } from './fixtures/countRetainedSlotNodes';
import { createRetainedSlotTree } from './fixtures/createRetainedSlotTree';

// filid:contract surface-slot-memory-bound
it('replaces the one visited host slot instead of retaining earlier lifetimes', () => {
  const tree = createRetainedSlotTree();
  if (!(tree.root instanceof FieldNode)) throw new Error('Expected runtime');
  const bound = countRetainedSlotNodes(tree.root);
  for (let index = 0; index < 64; index++) {
    tree.close();
    const slots: unknown = Reflect.get(tree.root, 'inactiveSlots');
    expect(slots).toBeInstanceOf(Map);
    if (!(slots instanceof Map)) throw new Error('Expected retained slots');
    expect(slots.size).toBe(1);
    const retained: unknown[] = [...slots.values()];
    expect(retained).toHaveLength(1);
    expect(Reflect.get(tree.root, 'runtime').literalStarRaw?.size ?? 0).toBe(0);
    expect(countRetainedSlotNodes(tree.root)).toBeLessThanOrEqual(bound);
    tree.open();
    expect(tree.root.find('/group/leaf')!.value).toBe('kept');
    expect(countRetainedSlotNodes(tree.root)).toBeLessThanOrEqual(bound);
  }
});

it('retains recursive candidates only through the supplied finite value depth', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    $defs: {
      entry: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          children: {
            type: 'array',
            options: { omitEmpty: false },
            items: { $ref: '#/$defs/entry' },
          },
        },
      },
    },
    properties: {
      open: { type: 'boolean' },
      tree: { $ref: '#/$defs/entry', controls: { active: '../open' } },
    },
  });
  if (!(root instanceof FieldNode)) throw new Error('Expected runtime');
  let value: unknown = { id: 'leaf', children: [] };
  for (let depth = 0; depth < 4; depth++)
    value = { id: String(depth), children: [value] };
  root.setValue({ open: true, tree: value });
  expect(root.find('/tree')!.value).toEqual(value);
  const bound = countRetainedSlotNodes(root);
  for (let index = 0; index < 8; index++) {
    root.find('/open')!.setValue(false);
    expect(Reflect.get(root, 'inactiveSlots')).toBeInstanceOf(Map);
    expect(countRetainedSlotNodes(root)).toBeLessThanOrEqual(bound);
    root.find('/open')!.setValue(true);
    expect(root.find('/tree')!.value).toEqual(value);
    expect(countRetainedSlotNodes(root)).toBeLessThanOrEqual(bound);
  }
});
