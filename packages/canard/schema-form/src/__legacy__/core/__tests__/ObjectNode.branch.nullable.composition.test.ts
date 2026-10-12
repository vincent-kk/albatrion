import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

/** Nullable object whose `oneOf` branch is always resolvable, so the composition cascade runs even while the value is `null`. */
const oneOfSchema = {
  type: 'object',
  properties: {
    target: {
      type: ['object', 'null'],
      properties: { kind: { type: 'string', enum: ['a', 'b'] } },
      oneOf: [
        { '&if': "./kind !== 'b'", properties: { aValue: { type: 'string' } } },
        {
          '&if': "./kind === 'b'",
          properties: { bValue: { type: 'string', default: 'B' } },
        },
      ],
    },
  },
} satisfies JSONSchema;

describe('ObjectNode branch nullable — null survives oneOf/anyOf recomposition', () => {
  it('oneOf를 가진 nullable 객체의 초기 null이 분기 확정 후에도 보존되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: oneOfSchema,
      defaultValue: { target: null },
    });
    await delay(10);

    expect(node.find('target')?.value).toBeNull();
    expect(node.value).toEqual({ target: null });
  });

  it('분기 자식에 default가 있어도 초기 null이 보존되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          target: {
            type: ['object', 'null'],
            properties: {
              kind: { type: 'string', enum: ['a', 'b'], default: 'a' },
            },
            oneOf: [
              {
                '&if': "./kind === 'a'",
                properties: { aValue: { type: 'string', default: 'A' } },
              },
              {
                '&if': "./kind === 'b'",
                properties: { bValue: { type: 'string', default: 'B' } },
              },
            ],
          },
        },
      },
      defaultValue: { target: null },
    });
    await delay(10);

    expect(node.value).toEqual({ target: null });
  });

  it('anyOf를 가진 nullable 객체의 초기 null이 보존되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          target: {
            type: ['object', 'null'],
            properties: { flag: { type: 'boolean' } },
            anyOf: [
              {
                '&if': './flag !== true',
                properties: { extra: { type: 'string' } },
              },
            ],
          },
        },
      },
      defaultValue: { target: null },
    });
    await delay(10);

    expect(node.value).toEqual({ target: null });
  });

  it('객체 값을 가진 뒤 노드에 setValue(null) 하면 null이 출력되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: oneOfSchema,
      defaultValue: { target: { kind: 'b', bValue: 'x' } },
    });
    await delay(10);
    expect(node.value).toEqual({ target: { kind: 'b', bValue: 'x' } });

    (node.find('target') as ObjectNode).setValue(null);
    await delay(10);

    expect(node.find('target')?.value).toBeNull();
    expect(node.value).toEqual({ target: null });
  });

  it('루트에서 setValue({ target: null }) 해도 null이 출력되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: oneOfSchema,
      defaultValue: { target: { kind: 'b', bValue: 'x' } },
    });
    await delay(10);

    (node as ObjectNode).setValue({ target: null });
    await delay(10);

    expect(node.value).toEqual({ target: null });
  });

  it('null 상태에서 분기 조건 자식에 값을 쓰면 해당 분기로 승격되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: oneOfSchema,
      defaultValue: { target: null },
    });
    await delay(10);

    (node.find('target/kind') as StringNode).setValue('b');
    await delay(10);

    expect(node.value).toEqual({ target: { kind: 'b', bValue: 'B' } });
  });

  it('anyOf를 가진 nullable 객체에 setValue(null) 하면 null이 출력되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          target: {
            type: ['object', 'null'],
            properties: { flag: { type: 'boolean' } },
            anyOf: [
              {
                '&if': './flag !== true',
                properties: { extra: { type: 'string' } },
              },
            ],
          },
        },
      },
      defaultValue: { target: { flag: false, extra: 'x' } },
    });
    await delay(10);
    expect(node.value).toEqual({ target: { flag: false, extra: 'x' } });

    (node.find('target') as ObjectNode).setValue(null);
    await delay(10);

    expect(node.value).toEqual({ target: null });
  });

  it('객체 밖 판별자로 분기가 바뀌어도 null이 보존되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['a', 'b'], default: 'a' },
          target: {
            type: ['object', 'null'],
            oneOf: [
              {
                '&if': "../mode === 'a'",
                properties: { aValue: { type: 'string', default: 'A' } },
              },
              {
                '&if': "../mode === 'b'",
                properties: { bValue: { type: 'string', default: 'B' } },
              },
            ],
          },
        },
      },
      defaultValue: { target: null },
    });
    await delay(10);
    expect(node.value).toEqual({ mode: 'a', target: null });

    (node.find('mode') as StringNode).setValue('b');
    await delay(10);

    expect(node.value).toEqual({ mode: 'b', target: null });
  });

  it('null이 되면 어느 분기의 자식이든 null이 되기 전의 값을 잊어야 함', async () => {
    const throughNull = async (defaultValue: Record<string, unknown>) => {
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: oneOfSchema,
        defaultValue,
      });
      await delay(10);
      (node.find('target') as ObjectNode).setValue(null);
      await delay(10);
      const shownWhileNull = node.find('target/aValue')?.value;

      (node.find('target/kind') as StringNode).setValue('b');
      await delay(10);
      const promotedToB = node.value;
      (node.find('target/kind') as StringNode).setValue('a');
      await delay(10);
      return { shownWhileNull, promotedToB, switchedToA: node.value };
    };

    // The seed gives a value to both branches: `bValue` to the one in use, `aValue` to the other.
    const seeded = await throughNull({
      target: { kind: 'b', bValue: 'x', aValue: 'stale' },
    });

    expect(seeded).toEqual(await throughNull({ target: null }));
    expect(seeded).toEqual({
      shownWhileNull: undefined,
      promotedToB: { target: { kind: 'b', bValue: 'B' } },
      switchedToA: { target: { kind: 'a' } },
    });
  });

  it('객체·배열인 분기 자식도 null이 되기 전의 값을 잊어야 함', async () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        target: {
          type: ['object', 'null'],
          properties: { kind: { type: 'string', enum: ['a', 'b'] } },
          oneOf: [
            {
              '&if': "./kind !== 'b'",
              properties: { aValue: { type: 'string' } },
            },
            {
              '&if': "./kind === 'b'",
              properties: {
                inner: {
                  type: 'object',
                  properties: { code: { type: 'string', default: 'C' } },
                },
                list: { type: 'array', items: { type: 'string' } },
                optional: {
                  type: ['object', 'null'],
                  default: null,
                  properties: { code: { type: 'string' } },
                },
                optionalList: {
                  type: ['array', 'null'],
                  default: null,
                  items: { type: 'string' },
                },
              },
            },
          ],
        },
      },
    } satisfies JSONSchema;
    const promoteToB = async (defaultValue: Record<string, unknown>) => {
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema,
        defaultValue,
      });
      await delay(10);
      (node.find('target') as ObjectNode).setValue(null);
      await delay(10);
      (node.find('target/kind') as StringNode).setValue('b');
      await delay(10);
      return node.value;
    };

    const seeded = await promoteToB({
      target: {
        kind: 'b',
        inner: { code: 'seeded' },
        list: ['seeded'],
        optional: { code: 'seeded' },
        optionalList: ['seeded'],
      },
    });

    expect(seeded).toEqual(await promoteToB({ target: null }));
    // What the blank form holds, a restored object child included: its own children's defaults.
    expect(seeded).toEqual({
      target: {
        kind: 'b',
        inner: { code: 'C' },
        optional: null,
        optionalList: null,
      },
    });
  });

  it.each([false, true])(
    'minItems를 채운 배열 분기 자식은 null을 거쳐도 채움으로 돌아가야 함 (terminal: %s)',
    async (terminal) => {
      const jsonSchema = {
        type: 'object',
        properties: {
          target: {
            type: ['object', 'null'],
            properties: { kind: { type: 'string', enum: ['a', 'b'] } },
            oneOf: [
              {
                '&if': "./kind !== 'b'",
                properties: { aValue: { type: 'string' } },
              },
              {
                '&if': "./kind === 'b'",
                properties: {
                  list: {
                    type: 'array',
                    terminal,
                    minItems: 2,
                    items: { type: 'string', default: 'S' },
                  },
                },
              },
            ],
          },
        },
      } satisfies JSONSchema;
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema,
        defaultValue: { target: { kind: 'b', list: ['x', 'y', 'z'] } },
      });
      await delay(10);

      (node.find('target') as ObjectNode).setValue(null);
      await delay(10);
      (node.find('target/kind') as StringNode).setValue('b');
      await delay(10);

      expect(node.value).toEqual({ target: { kind: 'b', list: ['S', 'S'] } });
    },
  );
});
