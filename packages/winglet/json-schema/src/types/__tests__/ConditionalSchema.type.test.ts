import { describe, expectTypeOf, it } from 'vitest';

import type { JSONSchema, NonNullableObjectSchema } from '../jsonSchema';

describe('if/then/else boolean schemas', () => {
  it('accepts else: false on a oneOf branch so a failed guard rejects the branch', () => {
    const schema = {
      type: 'object',
      properties: { method: { type: 'string', enum: ['card', 'bank'] } },
      oneOf: [
        {
          if: { properties: { method: { const: 'card' } }, required: ['method'] },
          then: { properties: { cardNumber: { type: 'string' } } },
          else: false,
        },
      ],
    } satisfies JSONSchema;
    expectTypeOf(schema).toHaveProperty('oneOf');
  });

  it('declares then and else as boolean schemas', () => {
    expectTypeOf<boolean>().toExtend<
      NonNullable<NonNullableObjectSchema['then']>
    >();
    expectTypeOf<boolean>().toExtend<
      NonNullable<NonNullableObjectSchema['else']>
    >();
  });
});
