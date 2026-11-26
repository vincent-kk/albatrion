import type { JSONSchema } from '@canard/schema-form';
import type { KeywordDefinition } from 'ajv';

/** A boolean keyword: `isEven: true` accepts an even number, `isEven: false` an odd one. */
export const isEvenKeyword = {
  keyword: 'isEven',
  schemaType: 'boolean',
  validate: (schema: boolean, data: unknown) =>
    typeof data === 'number' && (data % 2 === 0) === schema,
} satisfies KeywordDefinition;

/**
 * Builds fresh roots that branch on `isEven`, so no case reuses a root another case compiled.
 * @returns `ifSchema` puts `evenField` in `then` and `oddField` in `else`; `oneOfIfSchema` chooses
 *   between the same two fields with one `if` and `else: false` per branch; `bareOneOfSchema` uses
 *   the keyword inside its branches without `if`, gate or discriminator
 */
export const createIsEvenBranchSchemas = () => ({
  ifSchema: {
    type: 'object',
    properties: { n: { type: 'number' } },
    if: {
      type: 'object',
      properties: { n: { isEven: true } },
      required: ['n'],
    },
    then: { properties: { evenField: { type: 'string' } } },
    else: { properties: { oddField: { type: 'string' } } },
  } satisfies JSONSchema,
  oneOfIfSchema: {
    type: 'object',
    properties: { n: { type: 'number' } },
    oneOf: [
      {
        if: {
          type: 'object',
          properties: { n: { isEven: true } },
          required: ['n'],
        },
        then: { properties: { evenField: { type: 'string' } } },
        else: false,
      },
      {
        if: {
          type: 'object',
          properties: { n: { isEven: false } },
          required: ['n'],
        },
        then: { properties: { oddField: { type: 'string' } } },
        else: false,
      },
    ],
  } satisfies JSONSchema,
  bareOneOfSchema: {
    type: 'object',
    properties: { n: { type: 'number' } },
    oneOf: [
      { properties: { n: { isEven: true }, evenField: { type: 'string' } } },
      { properties: { n: { isEven: false }, oddField: { type: 'string' } } },
    ],
  } satisfies JSONSchema,
});
