import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

type Write = (root: ObjectNode) => void;

/**
 * Runs `writes` against a form whose `target` starts `null` and against one where it never was, and returns both `target` values.
 * @param jsonSchema - Root schema holding a nullable `target` object
 * @param writes - Writes applied to each form, settled one by one
 * @returns `promoted` from the null-seeded form, `fresh` from the form that never held `null`
 */
const runBoth = async (jsonSchema: JSONSchema, writes: Write[]) => {
  const results: unknown[] = [];
  for (const defaultValue of [{ target: null }, undefined]) {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema,
      defaultValue,
    }) as ObjectNode;
    await delay(10);
    for (const write of writes) {
      write(root);
      await delay(10);
    }
    results.push(root.find('target')?.value);
  }
  return { promoted: results[0], fresh: results[1] };
};

const setString =
  (path: string, value: string | undefined): Write =>
  (root) =>
    (root.find(path) as StringNode).setValue(value);

describe('ObjectNode branch nullable — a promoted null equals a fresh object with the same write', () => {
  const schema = {
    type: 'object',
    properties: {
      quantity: { type: 'number', default: 2 },
      target: {
        type: ['object', 'null'],
        properties: {
          note: { type: 'string' },
          reason: { type: 'string', default: 'because' },
          state: { type: ['string', 'null'], default: null },
          labels: { type: 'array', items: { type: 'string' } },
          total: {
            type: 'number',
            computed: { derived: '(../../quantity || 0) * 10' },
          },
        },
      },
    },
  } satisfies JSONSchema;

  it('자식 default와 derived 값을 포함한 새 객체로 풀려야 함', async () => {
    const { promoted, fresh } = await runBoth(schema, [
      setString('target/note', 'written'),
    ]);

    expect(promoted).toEqual({
      note: 'written',
      reason: 'because',
      state: null,
      total: 20,
    });
    expect(promoted).toEqual(fresh);
  });

  it('null 동안 바뀐 derived 값이 풀릴 때 반영되어야 함', async () => {
    const { promoted, fresh } = await runBoth(schema, [
      (root) => (root.find('quantity') as NumberNode).setValue(5),
      setString('target/note', 'written'),
    ]);

    expect(promoted).toMatchObject({ note: 'written', total: 50 });
    expect(promoted).toEqual(fresh);
  });

  it('값을 비우는 쓰기는 null을 풀지 않되, 풀릴 때 비워진 상태로 반영되어야 함', async () => {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schema,
      defaultValue: { target: null },
    }) as ObjectNode;
    await delay(10);

    (root.find('target/reason') as StringNode).setValue('');
    await delay(10);
    expect(root.find('target')?.value).toBeNull();

    const { promoted, fresh } = await runBoth(schema, [
      setString('target/reason', ''),
      setString('target/note', 'written'),
    ]);
    expect(promoted).toEqual({ note: 'written', state: null, total: 20 });
    expect(promoted).toEqual(fresh);
  });

  it('oneOf 분기 자식의 default도 활성 분기 것만 포함되어야 함', async () => {
    const branchSchema = {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['a', 'b'], default: 'a' },
        target: {
          type: ['object', 'null'],
          properties: { note: { type: 'string' } },
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
    } satisfies JSONSchema;

    const initial = await runBoth(branchSchema, [
      setString('target/note', 'written'),
    ]);
    expect(initial.promoted).toEqual({ note: 'written', aValue: 'A' });
    expect(initial.promoted).toEqual(initial.fresh);

    const switched = await runBoth(branchSchema, [
      setString('mode', 'b'),
      setString('target/note', 'written'),
    ]);
    expect(switched.promoted).toEqual({ note: 'written', bValue: 'B' });
    expect(switched.promoted).toEqual(switched.fresh);
  });
});
