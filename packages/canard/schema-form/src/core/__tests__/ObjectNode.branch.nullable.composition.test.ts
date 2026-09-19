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
});
