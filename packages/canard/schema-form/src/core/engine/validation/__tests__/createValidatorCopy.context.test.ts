import { expect, it } from 'vitest';
import { createValidatorCopy } from '../utils/copy/createValidatorCopy';

it.each([false, true])('keeps schema and data copies separate regardless of key order (%s)', (reverse) => {
  const shared = { type: 'string' as const, presentation: { placeholder: 'x' } };
  const entries = { const: { payload: shared }, properties: { field: shared } };
  const schema = reverse ? { type: 'object' as const, properties: entries.properties, const: entries.const } : { type: 'object' as const, ...entries };
  const copy = createValidatorCopy(schema);
  expect(copy).toMatchObject({ const: { payload: shared }, properties: { field: { type: 'string' } } });
  expect(copy).toHaveProperty('const.payload.presentation', shared.presentation);
  expect(copy).not.toHaveProperty('properties.field.presentation');
});
