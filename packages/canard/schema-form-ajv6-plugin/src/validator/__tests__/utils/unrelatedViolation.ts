import type { JSONSchema } from '@canard/schema-form';

/**
 * Build a root whose unrelated `count` field fails the meta-schema (`multipleOf: 0`) while its
 * `if` condition stays valid, so a guard on the condition can compile without the root's check.
 * @param variant - `'root-id'` adds a root `$id`, `'nested-id'` adds `$id` only in an unrelated
 * definition, any other value leaves the root without `$id`
 * @param serial - Suffix that keeps each `$id` unique within one AJV instance
 * @param condition - The valid `if` subschema
 * @returns A fresh root object; callers release it after use
 */
export const unrelatedViolation = (
  variant: string,
  serial: string,
  condition: JSONSchema,
): JSONSchema => ({
  ...(variant === 'root-id' ? { $id: `https://example.test/ir10-root-${serial}` } : {}),
  type: 'object',
  properties: {
    kind: { type: 'string' },
    count: { type: 'number', multipleOf: 0 },
  },
  ...(variant === 'nested-id'
    ? { definitions: { other: { $id: `https://example.test/ir10-nested-${serial}`, type: 'string' } } }
    : {}),
  if: condition,
  then: { required: ['count'] },
});
