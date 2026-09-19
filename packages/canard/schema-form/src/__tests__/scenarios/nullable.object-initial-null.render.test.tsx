import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * Nullable object seeded `null` whose children emit during their own
 * construction — an array child (omitEmpty emits `undefined`) or a child with a
 * `default`. `null` and `{}` carry different meanings to the consumer, so the
 * seeded `null` must reach `getValue()` / `onChange` unchanged while the child
 * fields stay mounted, and only a real child write may promote it.
 */
describe('nullable.object-initial-null.render — seeded null survives child construction', () => {
  const schema = {
    type: 'object',
    properties: {
      write: {
        type: 'object',
        properties: {
          open: {
            type: ['object', 'null'],
            properties: {
              labels: { type: 'array', items: { type: 'string' } },
            },
          },
          closed: {
            type: ['object', 'null'],
            properties: {
              labels: { type: 'array', items: { type: 'string' } },
              stateReason: { type: ['string', 'null'], default: null },
              note: { type: 'string' },
            },
          },
        },
        required: ['open', 'closed'],
      },
    },
    required: ['write'],
  } satisfies JSONSchema;

  const defaultValue = { write: { open: null, closed: null } };

  it('keeps every required nullable object key null (tree + onChange) with children mounted', async () => {
    const form = await renderForm(schema, { defaultValue });

    expect(form.node('/write/open')?.value).toBeNull();
    expect(form.node('/write/closed')?.value).toBeNull();
    expect(form.getValue()).toEqual(defaultValue);
    for (const reported of form.changeLog())
      expect(reported).toEqual(defaultValue);

    expect(form.exists('/write/open/labels')).toBe(true);
    expect(form.exists('/write/closed/stateReason')).toBe(true);
    expect(form.value('/write/closed/stateReason')).toBe('');
  });

  it('promotes a seeded null object only when the user writes a child value', async () => {
    const form = await renderForm(schema, { defaultValue });

    await form.type('/write/closed/note', 'done');

    expect(form.node('/write/closed')?.value).toEqual({ note: 'done' });
    expect(form.getValue()).toEqual({
      write: { open: null, closed: { note: 'done' } },
    });
  });

  it('returns to the seeded null on reset', async () => {
    const form = await renderForm(schema, { defaultValue });

    await form.type('/write/closed/note', 'done');
    await form.reset();

    expect(form.getValue()).toEqual(defaultValue);
    expect(form.value('/write/closed/note')).toBe('');
  });
});
