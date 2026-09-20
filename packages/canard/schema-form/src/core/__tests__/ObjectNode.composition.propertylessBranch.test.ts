import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

/** A composition branch that only constrains — no `properties` — owns no fields, and the form still has to build and switch through it. */
describe('ObjectNode composition — a branch without properties', () => {
  const oneOfSchema = {
    type: 'object',
    properties: {
      kind: { type: 'string', enum: ['a', 'b'], default: 'b' },
    },
    oneOf: [
      { '&if': "./kind === 'a'", required: ['kind'] },
      {
        '&if': "./kind === 'b'",
        properties: { bValue: { type: 'string', default: 'B' } },
      },
    ],
  } satisfies JSONSchema;

  const anyOfSchema = {
    type: 'object',
    properties: {
      kind: { type: 'string', enum: ['a', 'b'], default: 'b' },
    },
    anyOf: [
      { '&if': "./kind === 'a'", required: ['kind'] },
      {
        '&if': "./kind === 'b'",
        properties: { bValue: { type: 'string', default: 'B' } },
      },
    ],
  } satisfies JSONSchema;

  it('oneOf: 폼이 만들어져야 함', () => {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: oneOfSchema,
    }) as ObjectNode;

    expect(root.find('kind')).not.toBeNull();
    expect(root.find('bValue')).not.toBeNull();
  });

  it('oneOf: properties 없는 분기로 전환했다가 돌아와도 예외가 없어야 함', async () => {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: oneOfSchema,
    }) as ObjectNode;
    await delay(10);
    expect(root.value).toEqual({ kind: 'b', bValue: 'B' });

    (root.find('kind') as StringNode).setValue('a');
    await delay(10);
    expect(root.oneOfIndex).toBe(0);
    expect(root.value).toEqual({ kind: 'a' });

    (root.find('kind') as StringNode).setValue('b');
    await delay(10);
    expect(root.oneOfIndex).toBe(1);
    expect(root.value).toEqual({ kind: 'b', bValue: 'B' });
  });

  it('anyOf: 폼이 만들어져야 함', async () => {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: anyOfSchema,
    }) as ObjectNode;
    await delay(10);

    expect(root.value).toEqual({ kind: 'b', bValue: 'B' });
  });
});
