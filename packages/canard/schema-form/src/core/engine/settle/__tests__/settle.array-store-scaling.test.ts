import { describe, expect, it, vi } from 'vitest';

import { isTestFieldNode } from '@/schema-form/core/__tests__/fixtures/testFieldNode';
import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import type { ArrayNode } from '@/schema-form/core/surface';

const makeWatchedTree = (count: number) => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      flag: { type: 'string' },
      list: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'number' },
            watch: { type: 'string', controls: { watch: ['../key'] } },
          },
        },
      },
      others: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            watch: { type: 'string', controls: { watch: ['../../../flag'] } },
          },
        },
      },
    },
  });
  if (!isTestFieldNode(root)) throw new Error('Expected runtime tree');
  root.setValue({
    flag: 'a',
    list: Array.from({ length: 8 }, (_, key) => ({ key, watch: 'x' })),
    others: Array.from({ length: count }, () => ({ watch: 'y' })),
  });
  return root;
};

describe('I9 indexed array store costs', () => {
  it('49C-01 SETTLE-017 parses only affected declarations on remove(last)', () => {
    const root = makeWatchedTree(2000);
    const parse = JSON.parse;
    let parses = 0;
    const spy = vi.spyOn(JSON, 'parse').mockImplementation((value) => {
      parses++;
      return parse(value);
    });
    try {
      (root.find('/list') as ArrayNode).remove(7);
      expect(parses, `remove(last) JSON parses: ${parses}`).toBeLessThan(100);
    } finally {
      spy.mockRestore();
    }
  });
});
