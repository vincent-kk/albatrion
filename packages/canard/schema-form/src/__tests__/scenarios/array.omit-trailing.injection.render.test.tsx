/**
 * omitTrailing × data-injection / environment scenarios
 *
 * Pins the omitTrailing contract when values arrive programmatically —
 * FormHandle.setValue, node-level setValue, defaultValue hydration, reset —
 * and across environment variants (nullable schema, prefixItems, terminal
 * arrays, StrictMode, nested arrays). Equivalent manual demos live in
 * stories/41.OmitTrailing.stories.tsx.
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { ArrayNode } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import { renderForm } from '../renderForm';

const objectArraySchema = {
  type: 'object',
  properties: {
    arr: {
      type: 'array',
      items: { type: 'number' },
      options: { omitTrailing: true },
    },
  },
} as JsonSchema;

describe('array omitTrailing × injection and environments (render)', () => {
  it('trims a whole-form setValue injection while keeping every input mounted', async () => {
    const form = await renderForm(objectArraySchema);
    await form.setValue({ arr: [1, undefined, undefined] });
    expect(form.getValue()?.arr).toEqual([1]);
    expect(form.exists('/arr/2')).toBe(true);
  });

  it('stays stable when the same value is injected twice', async () => {
    const form = await renderForm(objectArraySchema);
    await form.setValue({ arr: [1, undefined, undefined] });
    await form.setValue({ arr: [1, undefined, undefined] });
    expect(form.getValue()?.arr).toEqual([1]);
    expect(form.exists('/arr/2')).toBe(true);
    expect(form.caughtErrors()).toEqual([]);
  });

  it('trims a node-level setValue injection and preserves leading undefined', async () => {
    const form = await renderForm(objectArraySchema);
    (form.node('/arr') as ArrayNode).setValue([undefined, 1, undefined]);
    await form.flush();
    expect(form.getValue()?.arr).toEqual([undefined, 1]);
  });

  it('emits the trimmed value from the very first defaultValue hydration', async () => {
    const form = await renderForm(objectArraySchema, {
      defaultValue: { arr: [1, undefined] },
    });
    expect(form.getValue()?.arr).toEqual([1]);
    expect(form.changeLog()[0]?.arr).toEqual([1]);
    expect(form.exists('/arr/1')).toBe(true);
  });

  it('returns to the trimmed default after reset()', async () => {
    const form = await renderForm(objectArraySchema, {
      defaultValue: { arr: [1, undefined] },
    });
    await form.setValue({ arr: [5, 6, 7] });
    expect(form.getValue()?.arr).toEqual([5, 6, 7]);
    await form.reset();
    expect(form.getValue()?.arr).toEqual([1]);
    expect(form.exists('/arr/1')).toBe(true);
  });

  it('passes null through untouched on a nullable array schema', async () => {
    const nullableSchema = {
      type: 'object',
      properties: {
        arr: {
          type: ['array', 'null'],
          items: { type: 'number' },
          options: { omitTrailing: true },
        },
      },
    } as JsonSchema;
    const form = await renderForm(nullableSchema);
    await form.setValue({ arr: null });
    expect(form.getValue()?.arr).toBeNull();
    await form.setValue({ arr: [1, undefined] });
    expect(form.getValue()?.arr).toEqual([1]);
  });

  it('trims a prefixItems root array', async () => {
    const form = await renderForm({
      type: 'array',
      prefixItems: [{ type: 'string' }, { type: 'number' }],
      options: { omitTrailing: true },
    } as JsonSchema);
    await form.setValue(['x', undefined]);
    expect(form.getValue()).toEqual(['x']);
    expect(form.exists('/1')).toBe(true);
  });

  it('trims a terminal array injection', async () => {
    const terminalSchema = {
      type: 'object',
      properties: {
        arr: {
          type: 'array',
          items: { type: 'number' },
          terminal: true,
          options: { omitTrailing: true },
        },
      },
    } as JsonSchema;
    const form = await renderForm(terminalSchema);
    await form.setValue({ arr: [1, undefined] });
    expect(form.getValue()?.arr).toEqual([1]);
  });

  it('behaves identically under React StrictMode', async () => {
    const form = await renderForm(objectArraySchema, { strictMode: true });
    await form.setValue({ arr: [1, undefined, undefined] });
    expect(form.getValue()?.arr).toEqual([1]);
    expect(form.exists('/arr/2')).toBe(true);
    expect(form.caughtErrors()).toEqual([]);
  });

  it('trims nested inner arrays injected through the outer object', async () => {
    const nestedSchema = {
      type: 'object',
      properties: {
        arr: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' },
            options: { omitTrailing: true },
          },
        },
      },
    } as JsonSchema;
    const form = await renderForm(nestedSchema);
    await form.setValue({ arr: [[1, undefined]] });
    expect(form.getValue()?.arr).toEqual([[1]]);
  });
});
