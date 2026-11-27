import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * The form never alters a value to make it validate, so whether a preserved
 * `null` is valid is the schema's decision. These cases pin what a validator
 * says about `null` next to a composition keyword whose branches declare no
 * `type`, and about `null` written to a non-nullable object or array, which
 * stays `null` instead of becoming `{}` or `[]`. The form prints no warning
 * for the `oneOf` schema here, so this failure shows only in validation.
 */
describe('nullable.object-validation.render — validity of a preserved null is the schema’s decision', () => {
  const branches: readonly JSONSchema[] = [
    {
      controls: { active: "./kind === 'a'" },
      properties: { aValue: { type: 'string' } },
    },
    {
      controls: { active: "./kind === 'b'" },
      properties: { bValue: { type: 'string' } },
    },
  ];
  const target = (composition: 'oneOf' | 'anyOf'): JSONSchema => ({
    type: 'object',
    properties: {
      target: {
        type: ['object', 'null'],
        properties: { kind: { type: 'string', enum: ['a', 'b'] } },
        [composition]: branches,
      },
    },
  });

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

  it.each([
    ['object', { type: 'object', properties: { a: { type: 'string' } } }],
    ['array', { type: 'array', items: { type: 'string' } }],
  ] as const)(
    'keeps null written to a non-nullable %s as a misfit the validator rejects',
    async (_kind, field) => {
      const form = await renderForm(
        { type: 'object', properties: { field } },
        { validator: true },
      );

      await act(async () => form.node('/field')!.setValue(null));
      await form.flush();

      expect(form.node('/field')!.value).toBeNull();
      expect(form.lastValue()).toEqual({ field: null });
      const errors = await form.validate();
      expect(errors.map((error) => [error.dataPath, error.keyword])).toEqual([
        ['/field', 'type'],
      ]);
    },
  );
});
