import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';

const build = (field: object, defaultValue: unknown) =>
  nodeFromJSONSchema({
    jsonSchema: { type: 'object', properties: { f: field } },
    defaultValue,
    validator: createTestValidator(),
  } as never) as any;

const items = { type: 'string' };
const properties = { a: { type: 'string' } };

describe('nullable branch nodes loaded as null', () => {
  it.each([
    ['array type list', { type: ['array', 'null'], items }],
    ['array nullable', { type: 'array', nullable: true, items }],
    [
      'array explicit branch',
      { type: ['array', 'null'], items, options: { terminal: false } },
    ],
    ['object type list', { type: ['object', 'null'], properties }],
    ['object nullable', { type: 'object', nullable: true, properties }],
  ])('%s reads null from the node and its output', (_label, field) => {
    const root = build(field, { f: null });
    expect(root.find('/f').value).toBeNull();
    expect(root.value).toEqual({ f: null });
    expect(root.outputValue).toEqual({ f: null });
  });
});
