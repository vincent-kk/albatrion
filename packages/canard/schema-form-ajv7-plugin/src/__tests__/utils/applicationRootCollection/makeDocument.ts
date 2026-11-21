import type { JSONSchema } from '@canard/schema-form';

/**
 * Build a document whose application registration shares the caller root or one descendant.
 * @param child - Select a shared string subschema instead of the recursive whole document.
 * @param key - Absolute application address used by the form reference.
 * @returns Independent schemas and data samples; samples never reference schema objects.
 */
export const makeDocument = (
  child: boolean,
  key: string,
): {
  root: JSONSchema;
  resource: JSONSchema;
  pointer: string;
  valid: unknown;
  invalid: unknown;
  guardValid: unknown;
  guardInvalid: unknown;
} => {
  if (child) {
    const resource: JSONSchema = { type: 'string', minLength: 2 };
    return {
      root: {
        type: 'object',
        definitions: { entry: resource },
        properties: { value: { $ref: key } },
      },
      resource,
      pointer: '/properties/value',
      valid: { value: 'valid' },
      invalid: { value: 3 },
      guardValid: 'valid',
      guardInvalid: 3,
    };
  }
  const root: JSONSchema = {
    type: 'object',
    properties: { value: { type: 'string' }, next: { $ref: key } },
  };
  return {
    root,
    resource: root,
    pointer: '/properties/next',
    valid: { next: { value: 'valid' } },
    invalid: { next: { value: 3 } },
    guardValid: { value: 'valid' },
    guardInvalid: { value: 3 },
  };
};
