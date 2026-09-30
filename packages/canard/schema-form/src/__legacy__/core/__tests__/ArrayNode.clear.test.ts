import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJSONSchema } from '@/schema-form/core';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { ObjectNode } from '../nodes/ObjectNode';

/** `clear()` does what it says, like `remove`/`pop`/`setValue([])`: `minItems` is a validation constraint and a construction/reset fill, not a guard on mutations. */
describe.each([false, true])(
  'ArrayNode clear() with minItems — terminal: %s',
  (terminal) => {
    it('minItems와 무관하게 모든 아이템을 제거하고, reset이 채움을 되돌려야 함', async () => {
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
      const list = root.find('list') as ArrayNode;
      expect(list.length).toBe(2);

      await list.clear();
      await delay(10);
      expect(list.length).toBe(0);
      expect(root.value).toEqual({});

      root.resetSubtree();
      await delay(10);
      expect(list.value).toEqual(['S', 'S']);
    });
  },
);
