/**
 * omitTrailing render-level scenarios
 *
 * Verifies the `options.omitTrailing` contract at the form boundary: trailing
 * `undefined` items disappear from emitted/validated/handle-read values while
 * the DOM keeps rendering every child input, and leading/middle `undefined`
 * items keep their indices (error paths stay aligned).
 */
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';

import type { JsonSchema } from '@/schema-form/types';

import { renderForm } from '../renderForm';

const objectArraySchema = (arraySchema: Record<string, unknown> = {}) =>
  ({
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        items: { type: 'string' },
        options: { omitTrailing: true },
        ...arraySchema,
      },
    },
  }) as JsonSchema;

describe('array omitTrailing (render)', () => {
  it('renders every empty input while the emitted value omits them', async () => {
    const form = await renderForm(objectArraySchema({ minItems: 3 }));
    expect(form.exists('/arr/0')).toBe(true);
    expect(form.exists('/arr/1')).toBe(true);
    expect(form.exists('/arr/2')).toBe(true);
    expect(form.getValue()?.arr).toBeUndefined();
  });

  it('emits only the filled prefix while keeping all inputs mounted', async () => {
    const form = await renderForm(objectArraySchema({ minItems: 3 }));
    await form.type('/arr/0', 'a');
    expect(form.getValue()?.arr).toEqual(['a']);
    expect(form.exists('/arr/1')).toBe(true);
    expect(form.exists('/arr/2')).toBe(true);
  });

  it('keeps leading undefined items when a later input is filled', async () => {
    const form = await renderForm(objectArraySchema({ minItems: 3 }));
    await form.type('/arr/2', 'c');
    expect(form.getValue()?.arr).toEqual([undefined, undefined, 'c']);
  });

  it('collapses back to undefined when the only filled input is cleared', async () => {
    const form = await renderForm(objectArraySchema({ minItems: 3 }));
    await form.type('/arr/2', 'c');
    await form.clear('/arr/2');
    expect(form.getValue()?.arr).toBeUndefined();
  });

  it('adds an item without introducing a trailing undefined in the emitted value', async () => {
    const form = await renderForm(objectArraySchema());
    await form.setValue({ arr: ['a'] });
    await form.addItem('/arr');
    expect(form.exists('/arr/1')).toBe(true);
    expect(form.getValue()?.arr).toEqual(['a']);
  });

  it('validates the trimmed value at a root-level array (minItems sees the trim)', async () => {
    const form = await renderForm(
      {
        type: 'array',
        items: { type: 'string' },
        minItems: 3,
        options: { omitTrailing: true },
      } as JsonSchema,
      { validator: true },
    );
    await form.setValue(['a', 'b', undefined]);
    const errors = await form.validate();
    expect(errors.some((error) => error.keyword === 'minItems')).toBe(true);
  });

  it('keeps error indices aligned by preserving middle undefined items', async () => {
    const form = await renderForm(
      {
        type: 'array',
        items: { type: 'number' },
        options: { omitTrailing: true },
      } as JsonSchema,
      { validator: true },
    );
    await form.setValue([1, undefined, 2, undefined]);
    const errors = await form.validate();
    const paths = errors.map((error) => error.dataPath);
    expect(paths).toContain('/1');
    expect(paths).not.toContain('/3');
  });

  it('exposes the trimmed value through getValue and submit at a root-level array', async () => {
    const onSubmit = vi.fn();
    const form = await renderForm(
      {
        type: 'array',
        items: { type: 'number' },
        options: { omitTrailing: true },
      } as JsonSchema,
      { onSubmit },
    );
    await form.setValue([1, 2, undefined]);
    expect(form.exists('/2')).toBe(true);
    expect(form.getValue()).toEqual([1, 2]);
    await form.handle.submit();
    expect(onSubmit).toHaveBeenCalledWith([1, 2]);
  });

  it('reads an empty array from getValue when every root-array item is empty', async () => {
    const form = await renderForm({
      type: 'array',
      items: { type: 'number' },
      options: { omitTrailing: true },
    } as JsonSchema);
    await form.setValue([undefined, undefined]);
    expect(form.exists('/1')).toBe(true);
    expect(form.getValue()).toEqual([]);
  });

  it('keeps an empty plain root array as [] at getValue (omitEmpty must not leak into output)', async () => {
    const form = await renderForm({
      type: 'array',
      items: { type: 'number' },
    } as JsonSchema);
    await form.setValue([]);
    expect(form.getValue()).toEqual([]);
  });

  it('reports minItems (not a type error) for an empty plain root array', async () => {
    const form = await renderForm(
      { type: 'array', items: { type: 'number' }, minItems: 1 } as JsonSchema,
      { validator: true },
    );
    await form.setValue([]);
    const errors = await form.validate();
    expect(errors.some((error) => error.keyword === 'minItems')).toBe(true);
    expect(errors.some((error) => error.keyword === 'type')).toBe(false);
  });

  it('emits a consistent [] from the very first onChange for an all-empty omitTrailing array', async () => {
    const form = await renderForm({
      type: 'array',
      items: { type: 'string' },
      minItems: 3,
      options: { omitTrailing: true },
    } as JsonSchema);
    expect(form.changeLog()[0]).toEqual([]);
    expect(form.changeLog()).not.toContainEqual(undefined);
  });
});
