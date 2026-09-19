import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * A nullable object that becomes `null` shows a blank form: its fields fall back
 * to their schema defaults, whatever the object held before. What the user sees
 * in those fields is what the object becomes on the first write — tree and DOM
 * agree, and the data discarded by `null` does not come back.
 */
describe('nullable.object-blank-state.render — null shows a blank form built from schema defaults', () => {
  const schema = {
    type: 'object',
    properties: {
      target: {
        type: ['object', 'null'],
        properties: {
          note: { type: 'string' },
          reason: { type: 'string', default: 'because' },
        },
      },
    },
  } satisfies JSONSchema;

  const filled = { target: { note: 'typed', reason: 'edited' } };

  it('refreshes the child inputs to their schema defaults when the object is set to null', async () => {
    const form = await renderForm(schema, { defaultValue: filled });
    expect(form.value('/target/reason')).toBe('edited');

    await form.setValue({ target: null });

    expect(form.getValue()).toEqual({ target: null });
    expect(form.value('/target/note')).toBe('');
    expect(form.value('/target/reason')).toBe('because');
  });

  it('promotes to exactly what the blank form shows plus the user write', async () => {
    const form = await renderForm(schema, { defaultValue: filled });
    await form.setValue({ target: null });

    await form.type('/target/note', 'again');

    expect(form.getValue()).toEqual({
      target: { note: 'again', reason: 'because' },
    });
  });

  it('keeps null when the user only empties a field, and honors it on promotion', async () => {
    const form = await renderForm(schema, { defaultValue: { target: null } });

    await form.clear('/target/reason');
    expect(form.getValue()).toEqual({ target: null });

    await form.type('/target/note', 'again');
    expect(form.getValue()).toEqual({ target: { note: 'again' } });
  });
});
