import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { BooleanNode } from '../nodes/BooleanNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

/** Values the form produces by itself (derived, reset on activation) must never turn a `null` object into an object; only a write from outside may. */
describe('ObjectNode branch nullable — automatic writes never promote null', () => {
  const derivedSchema = {
    type: 'object',
    properties: {
      quantity: { type: 'number', default: 2 },
      target: {
        type: ['object', 'null'],
        properties: {
          note: { type: 'string' },
          total: {
            type: 'number',
            computed: { derived: '(../../quantity || 0) * 10' },
          },
        },
      },
    },
  } satisfies JSONSchema;

  it('derived 자식이 있어도 초기 null이 보존되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: derivedSchema,
      defaultValue: { target: null },
    });
    await delay(10);

    expect(node.value).toEqual({ quantity: 2, target: null });
  });

  it('null 상태에서 derived 의존값이 바뀌어도 null이 보존되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: derivedSchema,
      defaultValue: { target: { note: 'kept' } },
    });
    await delay(10);

    (node.find('target') as ObjectNode).setValue(null);
    await delay(10);
    (node.find('quantity') as NumberNode).setValue(5);
    await delay(10);

    expect(node.value).toEqual({ quantity: 5, target: null });
  });

  it('중첩 객체 안의 derived 값도 null 조상을 승격시키지 않아야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          quantity: { type: 'number', default: 2 },
          target: {
            type: ['object', 'null'],
            properties: {
              inner: {
                type: 'object',
                properties: {
                  total: {
                    type: 'number',
                    computed: { derived: '(../../../quantity || 0) * 10' },
                  },
                },
              },
            },
          },
        },
      },
      defaultValue: { target: null },
    });
    await delay(10);
    expect(node.value).toEqual({ quantity: 2, target: null });

    (node.find('quantity') as NumberNode).setValue(5);
    await delay(10);

    expect(node.value).toEqual({ quantity: 5, target: null });
  });

  it('배열 아이템 안의 derived 값도 null 조상을 승격시키지 않아야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          quantity: { type: 'number', default: 2 },
          target: {
            type: ['object', 'null'],
            properties: {
              rows: {
                type: 'array',
                default: [{}],
                items: {
                  type: 'object',
                  properties: {
                    total: {
                      type: 'number',
                      computed: { derived: '(../../../../quantity || 0) * 10' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      defaultValue: { target: null },
    });
    await delay(10);
    expect(node.value).toEqual({ quantity: 2, target: null });

    (node.find('quantity') as NumberNode).setValue(5);
    await delay(10);

    expect(node.value).toEqual({ quantity: 5, target: null });
  });

  it('computed active 전환으로 자식이 default를 되찾아도 null이 보존되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: false },
          target: {
            type: ['object', 'null'],
            properties: {
              reason: {
                type: 'string',
                default: 'because',
                computed: { active: '../../enabled === true' },
              },
            },
          },
        },
      },
      defaultValue: { target: null },
    });
    await delay(10);
    expect(node.value).toEqual({ enabled: false, target: null });

    (node.find('enabled') as BooleanNode).setValue(true);
    await delay(10);

    expect(node.find('target/reason')?.value).toBe('because');
    expect(node.value).toEqual({ enabled: true, target: null });
  });

  it('밖에서 자식에 값을 쓰면 null이 풀려야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: derivedSchema,
      defaultValue: { target: null },
    });
    await delay(10);

    (node.find('target/note') as StringNode).setValue('written');
    await delay(10);

    expect(node.find('target')?.value).not.toBeNull();
    expect((node.find('target') as ObjectNode).value?.note).toBe('written');
  });

  it.each([
    ['중첩 객체', 'target/inner/note', 'inner', { note: 'deep' }],
    ['배열 아이템', 'target/rows/0/label', 'rows', [{ label: 'deep' }]],
  ] as const)(
    '%s 안쪽에 쓴 값도 null 조상을 풀어야 함',
    async (_label, path, key, expected) => {
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            target: {
              type: ['object', 'null'],
              properties: {
                inner: {
                  type: 'object',
                  properties: { note: { type: 'string' } },
                },
                rows: {
                  type: 'array',
                  default: [{}],
                  items: {
                    type: 'object',
                    properties: { label: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
        defaultValue: { target: null },
      });
      await delay(10);
      expect(node.value).toEqual({ target: null });

      (node.find(path) as StringNode).setValue('deep');
      await delay(10);

      expect((node.find('target') as ObjectNode).value?.[key]).toEqual(
        expected,
      );
    },
  );
});
