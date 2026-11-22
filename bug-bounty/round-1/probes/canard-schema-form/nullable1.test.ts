import { describe, expect, it } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

const build = (jsonSchema: any, defaultValue?: any, extra: any = {}) =>
  nodeFromJSONSchema({
    jsonSchema,
    defaultValue,
    validator: createTestValidator(),
    ...extra,
  }) as any;

const variants: [string, any][] = [
  ['type-array-plain', { type: ['array', 'null'], items: { type: 'string' } }],
  [
    'type-array-terminal-false',
    { type: ['array', 'null'], items: { type: 'string' }, options: { terminal: false } },
  ],
  ['nullable-true', { type: 'array', nullable: true, items: { type: 'string' } }],
  [
    'nullable-true-terminal-false',
    { type: 'array', nullable: true, items: { type: 'string' }, options: { terminal: false } },
  ],
  [
    'object-terminal-false',
    { type: ['object', 'null'], properties: { a: { type: 'string' } }, options: { terminal: false } },
  ],
  [
    'array-other-option',
    { type: ['array', 'null'], items: { type: 'string' }, options: { omitEmpty: false } },
  ],
];

describe('nullable branch load', () => {
  it.each(variants)('%s loads null as null', (_name, arrSchema) => {
    const root = build(
      { type: 'object', properties: { arr: arrSchema } },
      { arr: null },
    );
    const arr = root.find('/arr');
    expect({ v: arr.value, root: root.value, out: root.outputValue }).toEqual({
      v: null,
      root: { arr: null },
      out: { arr: null },
    });
  });
});
