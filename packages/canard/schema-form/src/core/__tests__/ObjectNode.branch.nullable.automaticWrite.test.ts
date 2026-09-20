import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { SetValueOption, nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { BooleanNode } from '../nodes/BooleanNode';
import type { NullNode } from '../nodes/NullNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import type { SchemaNode } from '../types';

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

  it('자동 쓰기와 같은 배치에 섞여 들어온 밖의 쓰기는 null을 풀어야 함', async () => {
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
                  note: { type: 'string' },
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

    (node.find('quantity') as NumberNode).setValue(5);
    (node.find('target/inner/note') as StringNode).setValue('user');
    await delay(10);

    expect(node.value).toEqual({
      quantity: 5,
      target: { inner: { note: 'user', total: 50 } },
    });
  });

  it('boolean 자식의 derived 값도 null을 풀지 않아야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          quantity: { type: 'number', default: 2 },
          target: {
            type: ['object', 'null'],
            properties: {
              bulk: {
                type: 'boolean',
                computed: { derived: '(../../quantity || 0) > 3' },
              },
            },
          },
        },
      },
      defaultValue: { target: null },
    });
    await delay(10);

    (node.find('quantity') as NumberNode).setValue(5);
    await delay(10);

    expect(node.find('target/bulk')?.value).toBe(true);
    expect(node.value).toEqual({ quantity: 5, target: null });
  });

  it.each([
    [
      '직계 자식',
      'target/country',
      { country: 'KR', inner: { code: 'C' }, rows: ['S'] },
    ],
    [
      '중첩 객체의 유일한 자식',
      'target/inner/code',
      { country: 'KR', inner: { code: 'C' }, rows: ['S'] },
    ],
    [
      '배열 아이템',
      'target/rows/0',
      { country: 'KR', inner: { code: 'C' }, rows: ['S'] },
    ],
  ] as const)(
    '%s에 이미 보이는 default와 같은 값을 써도 null이 풀려야 함',
    async (_label, path, expected) => {
      const jsonSchema = {
        type: 'object',
        properties: {
          target: {
            type: ['object', 'null'],
            properties: {
              country: { type: 'string', enum: ['KR', 'US'], default: 'KR' },
              inner: {
                type: 'object',
                properties: { code: { type: 'string', default: 'C' } },
              },
              rows: {
                type: 'array',
                minItems: 1,
                items: { type: 'string', default: 'S' },
              },
            },
          },
        },
      } satisfies JSONSchema;
      const values: unknown[] = [];
      for (const defaultValue of [{ target: null }, undefined]) {
        const node = nodeFromJSONSchema({
          onChange: () => {},
          jsonSchema,
          defaultValue,
        });
        await delay(10);
        const field = node.find(path) as StringNode;
        field.setValue(field.value);
        await delay(10);
        values.push(node.find('target')?.value);
      }

      expect(values[0]).toEqual(expected);
      expect(values[0]).toEqual(values[1]);
    },
  );

  /** Nullable `target` with one child of every node kind, each showing a default. */
  const everyKindSchema = {
    type: 'object',
    properties: {
      target: {
        type: ['object', 'null'],
        properties: {
          note: { type: 'string', default: 'S' },
          count: { type: 'number', default: 1 },
          flag: { type: 'boolean', default: true },
          nothing: { type: 'null', default: null },
          inner: {
            type: 'object',
            properties: { code: { type: 'string', default: 'C' } },
          },
          blob: {
            type: 'object',
            terminal: true,
            properties: { code: { type: 'string', default: 'C' } },
          },
          rows: { type: 'array', default: ['R'], items: { type: 'string' } },
          cells: {
            type: 'array',
            terminal: true,
            default: ['R'],
            items: { type: 'string' },
          },
        },
      },
    },
  } satisfies JSONSchema;

  /** Writes, with `Merge`, the value the named child of `target` already shows. */
  it.each<[name: string, write: (root: SchemaNode) => void]>([
    [
      'note',
      (root) =>
        (root.find('target/note') as StringNode).setValue(
          'S',
          SetValueOption.Merge,
        ),
    ],
    [
      'count',
      (root) =>
        (root.find('target/count') as NumberNode).setValue(
          1,
          SetValueOption.Merge,
        ),
    ],
    [
      'flag',
      (root) =>
        (root.find('target/flag') as BooleanNode).setValue(
          true,
          SetValueOption.Merge,
        ),
    ],
    [
      'nothing',
      (root) =>
        (root.find('target/nothing') as NullNode).setValue(
          null,
          SetValueOption.Merge,
        ),
    ],
    [
      'inner',
      (root) =>
        (root.find('target/inner') as ObjectNode).setValue(
          { code: 'C' },
          SetValueOption.Merge,
        ),
    ],
    [
      'blob',
      (root) =>
        (root.find('target/blob') as ObjectNode).setValue(
          { code: 'C' },
          SetValueOption.Merge,
        ),
    ],
    [
      'cells',
      (root) =>
        (root.find('target/cells') as ArrayNode).setValue(
          ['R'],
          SetValueOption.Merge,
        ),
    ],
  ])(
    '%s에 이미 보이는 값과 같은 값을 Merge로 써도 null이 풀려야 함',
    async (_name, write) => {
      const values: unknown[] = [];
      for (const defaultValue of [{ target: null }, undefined]) {
        const node = nodeFromJSONSchema({
          onChange: () => {},
          jsonSchema: everyKindSchema,
          defaultValue,
        });
        await delay(10);
        write(node);
        await delay(10);
        values.push(node.find('target')?.value);
      }

      expect(values[0]).not.toBeNull();
      expect(values[0]).toEqual(values[1]);
    },
  );

  it('중첩 객체에 빈 객체를 Merge로 쓰는 것은 값을 담지 않으므로 null을 풀지 않아야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: everyKindSchema,
      defaultValue: { target: null },
    });
    await delay(10);

    (node.find('target/inner') as ObjectNode).setValue(
      {},
      SetValueOption.Merge,
    );
    await delay(10);

    expect(node.value).toEqual({ target: null });
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
