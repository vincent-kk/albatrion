import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { SetValueOption, nodeFromJSONSchema } from '@/schema-form/core';

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

    it('배열을 뺀 부모 교체 쓰기는 배열을 비우고, Merge는 그대로 두어야 함', async () => {
      const merged = await build();
      merged.root.setValue({}, SetValueOption.Merge);
      await delay(10);
      expect(merged.list.length).toBe(2);

      const replaced = await build();
      replaced.root.setValue({});
      await delay(10);
      expect(replaced.list.length).toBe(0);
    });
  },
);
