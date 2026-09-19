import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJSONSchema } from '@/schema-form/core';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { ObjectNode } from '../nodes/ObjectNode';

/** A plain `setValue(undefined)` empties an array; only a reset re-establishes the `minItems` fill. */
describe.each([false, true])(
  'ArrayNode setValue(undefined) with minItems — terminal: %s',
  (terminal) => {
    const build = async () => {
      const root = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            list: {
              type: 'array',
              terminal,
              minItems: 2,
              items: { type: 'string', default: 'S' },
            },
          },
        },
      }) as ObjectNode;
      await delay(10);
      return { root, list: root.find('list') as ArrayNode };
    };

    it('일반 setValue(undefined)는 minItems와 무관하게 전부 비워야 함', async () => {
      const { root, list } = await build();
      expect(list.length).toBe(2);

      list.setValue(undefined);
      await delay(10);

      expect(list.length).toBe(0);
      expect(root.value).toEqual({});
    });

    it('reset은 minItems 채움을 되돌려야 함', async () => {
      const { root, list } = await build();
      list.setValue(['only']);
      await delay(10);

      root.resetSubtree();
      await delay(10);

      expect(list.value).toEqual(['S', 'S']);
    });
  },
);
