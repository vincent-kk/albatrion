import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * The form never alters a value to make it validate, so whether a preserved
 * `null` is valid is the schema's decision. These cases pin what a validator
 * says about `null` next to a composition keyword whose branches declare no
 * `type`; `nullable.object-null-branch.render` covers the pattern that validates.
 * The `oneOf` schema here is one the form warns about in development
 * (`NULLABLE_ONE_OF_NULL_UNREACHABLE`): that warning describes this very failure.
 */
describe('nullable.object-validation.render — validity of a preserved null is the schema’s decision', () => {
  const branches = [
    { '&if': "./kind === 'a'", properties: { aValue: { type: 'string' } } },
    { '&if': "./kind === 'b'", properties: { bValue: { type: 'string' } } },
  ];
  const target = (composition: 'oneOf' | 'anyOf') =>
    ({
      type: 'object',
      properties: {
        target: {
          type: ['object', 'null'],
          properties: { kind: { type: 'string', enum: ['a', 'b'] } },
          [composition]: branches,
        },
      },
    }) as JSONSchema;

  it('reports the oneOf error a validator gives for null: properties-only branches all match it', async () => {
    const form = await renderForm(target('oneOf'), {
      defaultValue: { target: null },
      validator: true,
    });

    expect(form.getValue()).toEqual({ target: null });
    const errors = await form.validate();
    expect(errors.map((error) => [error.dataPath, error.keyword])).toEqual([
      ['/target', 'oneOf'],
    ]);
  });

  it('validates clean with anyOf, which null satisfies', async () => {
    const form = await renderForm(target('anyOf'), {
      defaultValue: { target: null },
      validator: true,
    });

    expect(form.getValue()).toEqual({ target: null });
    expect(await form.validate()).toEqual([]);
  });
});
