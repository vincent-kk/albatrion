/**
 * omitTrailing × conditional-schema scenarios
 *
 * Pins the omitTrailing contract on the fragile conditional surfaces:
 * oneOf/anyOf branch switching (branch nodes are created, reset and restored),
 * native if/then/else driving `required` against the TRIMMED value, and
 * `&active` toggles excluding/restoring the array node. Equivalent manual
 * demos live in stories/41.OmitTrailing.stories.tsx.
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@/schema-form/types';

import { renderForm } from '../renderForm';

const TRIMMED_ARR = {
  type: 'array',
  items: { type: 'string' },
  minItems: 2,
  options: { omitTrailing: true },
} as const;

const oneOfSchema = {
  type: 'object',
  properties: {
    disc: { type: 'string', enum: ['a', 'b'] },
  },
  oneOf: [
    {
      computed: { if: "./disc === 'a'" },
      properties: { arr: TRIMMED_ARR },
    },
    {
      computed: { if: "./disc === 'b'" },
      properties: { other: { type: 'string' } },
    },
  ],
} as JsonSchema;

describe('array omitTrailing × conditional schemas (render)', () => {
  it('trims the array inside an active oneOf branch', async () => {
    const form = await renderForm(oneOfSchema);
    await form.selectOption('/disc', 'a');
    expect(form.exists('/arr/0')).toBe(true);
    await form.type('/arr/0', 'x');
    expect(form.getValue()?.arr).toEqual(['x']);
    expect(form.exists('/arr/1')).toBe(true);
  });

  it('drops the arr key entirely while the other branch is active', async () => {
    const form = await renderForm(oneOfSchema);
    await form.selectOption('/disc', 'a');
    await form.type('/arr/0', 'x');
    await form.selectOption('/disc', 'b');
    expect(form.getValue()?.arr).toBeUndefined();
  });

  it('restores the empty minItems inputs after a branch round-trip (a → b → a)', async () => {
    // Reactivation keeps the restore-defaults contract; the Reset refill re-establishes the minItems skeleton.
    const form = await renderForm(oneOfSchema);
    await form.selectOption('/disc', 'a');
    await form.type('/arr/0', 'x');
    await form.selectOption('/disc', 'b');
    expect(form.getValue()?.arr).toBeUndefined();
    await form.selectOption('/disc', 'a');
    expect(form.exists('/arr/0')).toBe(true);
    expect(form.exists('/arr/1')).toBe(true);
    expect(form.getValue()?.arr).toBeUndefined();
    await form.type('/arr/1', 'y');
    expect(form.getValue()?.arr).toEqual([undefined, 'y']);
  });

  it('preserves leading undefined and trims trailing inside an anyOf branch', async () => {
    const anyOfSchema = {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['list', 'none'] },
      },
      anyOf: [
        {
          computed: { if: "./mode === 'list'" },
          properties: { arr: TRIMMED_ARR },
        },
        {
          computed: { if: "./mode === 'none'" },
          properties: { note: { type: 'string' } },
        },
      ],
    } as JsonSchema;
    const form = await renderForm(anyOfSchema);
    await form.selectOption('/mode', 'list');
    await form.type('/arr/1', 'y');
    expect(form.getValue()?.arr).toEqual([undefined, 'y']);
    await form.clear('/arr/1');
    expect(form.getValue()?.arr).toBeUndefined();
  });

  it('lets if/then/else required judge the TRIMMED value (empty inputs stay required)', async () => {
    const ifThenElseSchema = {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['movie', 'game'] },
        tags: TRIMMED_ARR,
      },
      if: { properties: { category: { enum: ['movie'] } } },
      then: { required: ['tags'] },
      else: {},
    } as JsonSchema;
    const form = await renderForm(ifThenElseSchema, { validator: true });
    await form.selectOption('/category', 'movie');
    const movieErrors = await form.validate();
    expect(
      movieErrors.some(
        (error) =>
          error.keyword === 'required' &&
          String(error.dataPath).includes('tags'),
      ),
    ).toBe(true);
    await form.selectOption('/category', 'game');
    const gameErrors = await form.validate();
    expect(
      gameErrors.some(
        (error) =>
          error.keyword === 'required' &&
          String(error.dataPath).includes('tags'),
      ),
    ).toBe(false);
  });

  it('keeps the empty minItems inputs across an &active exclude/restore cycle', async () => {
    const activeSchema = {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        arr: { ...TRIMMED_ARR, '&active': '../enabled === true' },
      },
    } as JsonSchema;
    const form = await renderForm(activeSchema);
    await form.toggle('/enabled');
    await form.type('/arr/0', 'x');
    expect(form.getValue()?.arr).toEqual(['x']);
    await form.toggle('/enabled');
    expect(form.getValue()?.arr).toBeUndefined();
    await form.toggle('/enabled');
    expect(form.exists('/arr/0')).toBe(true);
    expect(form.exists('/arr/1')).toBe(true);
    await form.type('/arr/0', 'z');
    expect(form.getValue()?.arr).toEqual(['z']);
  });

  it('honors each branch schema options independently (trimming vs raw)', async () => {
    const mixedSchema = {
      type: 'object',
      properties: {
        disc: { type: 'string', enum: ['a', 'b'] },
      },
      oneOf: [
        {
          computed: { if: "./disc === 'a'" },
          properties: { arr: TRIMMED_ARR },
        },
        {
          computed: { if: "./disc === 'b'" },
          properties: {
            arr: { type: 'array', items: { type: 'string' }, minItems: 2 },
          },
        },
      ],
    } as JsonSchema;
    const form = await renderForm(mixedSchema);
    await form.selectOption('/disc', 'a');
    await form.type('/arr/0', 'x');
    expect(form.getValue()?.arr).toEqual(['x']);
    await form.selectOption('/disc', 'b');
    await form.type('/arr/0', 'y');
    expect(form.getValue()?.arr).toEqual(['y', undefined]);
  });

  it('keeps error indices aligned for middle undefined inside a conditional branch', async () => {
    const numericBranchSchema = {
      type: 'object',
      properties: {
        disc: { type: 'string', enum: ['a', 'b'] },
      },
      oneOf: [
        {
          computed: { if: "./disc === 'a'" },
          properties: {
            arr: {
              type: 'array',
              items: { type: 'number' },
              options: { omitTrailing: true },
            },
          },
        },
        {
          computed: { if: "./disc === 'b'" },
          properties: { other: { type: 'string' } },
        },
      ],
    } as JsonSchema;
    const form = await renderForm(numericBranchSchema, { validator: true });
    await form.selectOption('/disc', 'a');
    await form.setValue({ disc: 'a', arr: [1, undefined, 2, undefined] });
    const errors = await form.validate();
    const paths = errors.map((error) => error.dataPath);
    expect(paths).toContain('/arr/1');
    expect(paths).not.toContain('/arr/3');
  });

  it('stays convergent (no caught errors) across branch round-trips', async () => {
    const form = await renderForm(oneOfSchema);
    await form.selectOption('/disc', 'a');
    await form.type('/arr/0', 'x');
    await form.selectOption('/disc', 'b');
    await form.selectOption('/disc', 'a');
    expect(form.caughtErrors()).toEqual([]);
  });
});
