import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';

/**
 * The nullable-object contract applied to arrays, for both strategies: `null` means "no array",
 * it changes only by an explicit assignment or a write that carries a value, and the array it
 * becomes is the same whichever way it became `null`. A null array has no items, so its blank
 * state is the empty list.
 */
const lists = {
  branch: {
    type: ['array', 'null'],
    minItems: 2,
    items: {
      type: 'object',
      properties: {
        label: { type: 'string', default: 'L' },
        total: {
          type: 'number',
          computed: { derived: '(../../../quantity || 0) * 10' },
        },
      },
    },
  },
  terminal: {
    type: ['array', 'null'],
    terminal: true,
    minItems: 2,
    items: { type: 'string', default: 'S' },
  },
} satisfies Record<string, JSONSchema>;

const pushed = {
  branch: [{ label: 'L', total: 20 }],
  terminal: ['S'],
};

const filled = {
  branch: [{ label: 'a' }, { label: 'b' }],
  terminal: ['a', 'b'],
};

type Strategy = keyof typeof lists;

const build = async (strategy: Strategy, list: unknown) => {
  const root = nodeFromJSONSchema({
    onChange: () => {},
    jsonSchema: {
      type: 'object',
      properties: {
        quantity: { type: 'number', default: 2 },
        list: lists[strategy],
      },
    },
    defaultValue: { list },
  }) as ObjectNode;
  await delay(10);
  return { root, list: root.find('list') as ArrayNode };
};

const waysToNull = {
  'defaultValue null': (strategy: Strategy) => build(strategy, null),
  'setValue(null)': async (strategy: Strategy) => {
    const form = await build(strategy, filled[strategy]);
    form.list.setValue(null);
    await delay(10);
    return form;
  },
};

describe.each(['branch', 'terminal'] as const)(
  'ArrayNode nullable consistency — %s strategy',
  (strategy) => {
    describe.each(Object.keys(waysToNull) as (keyof typeof waysToNull)[])(
      '%s',
      (way) => {
        it('null이 출력되고 아이템이 없어야 함 (minItems 채움 없음)', async () => {
          const { root, list } = await waysToNull[way](strategy);

          expect(list.value).toBeNull();
          expect(list.length).toBe(0);
          expect(root.value).toEqual({ quantity: 2, list: null });
        });

        it('의존값이 바뀌어도 null이 보존되어야 함', async () => {
          const { root } = await waysToNull[way](strategy);

          (root.find('quantity') as NumberNode).setValue(5);
          await delay(10);

          expect(root.value).toEqual({ quantity: 5, list: null });
        });

        it('clear()는 값 없는 쓰기이므로 null을 풀지 않아야 함', async () => {
          const { root, list } = await waysToNull[way](strategy);

          await list.clear();
          await delay(10);

          expect(list.value).toBeNull();
          expect(root.value).toEqual({ quantity: 2, list: null });
        });

        it('push하면 빈 배열에 같은 push를 한 값으로 풀려야 함', async () => {
          const { list } = await waysToNull[way](strategy);
          const empty = await build(strategy, []);

          await list.push();
          await empty.list.push();
          await delay(10);

          expect(list.value).toEqual(pushed[strategy]);
          expect(list.value).toEqual(empty.list.value);
        });

        it('명시적으로 setValue([]) 하면 빈 배열이 되어야 함', async () => {
          const { list } = await waysToNull[way](strategy);

          list.setValue([]);
          await delay(10);

          expect(list.value).toEqual([]);
        });
      },
    );
  },
);
