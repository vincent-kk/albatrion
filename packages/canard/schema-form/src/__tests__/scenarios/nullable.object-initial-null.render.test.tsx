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

  it('promotes a seeded null object to a fresh object carrying the user write', async () => {
    const form = await renderForm(schema, { defaultValue });

    await form.type('/write/closed/note', 'done');

    // Same as an object that never was null: the sibling default comes along.
    expect(form.node('/write/closed')?.value).toEqual({
      stateReason: null,
      note: 'done',
    });
    expect(form.getValue()).toEqual({
      write: { open: null, closed: { stateReason: null, note: 'done' } },
    });
  });

  it('returns to the seeded null on reset', async () => {
    const form = await renderForm(schema, { defaultValue });

    await form.type('/write/closed/note', 'done');
    await form.reset();

    expect(form.getValue()).toEqual(defaultValue);
    expect(form.value('/write/closed/note')).toBe('');
  });

  describe('with oneOf branches whose children carry defaults', () => {
    const branchSchema = {
      type: 'object',
      properties: {
        target: {
          type: ['object', 'null'],
          properties: {
            kind: { type: 'string', enum: ['a', 'b'], default: 'a' },
          },
          oneOf: [
            {
              '&if': "./kind === 'a'",
              properties: { aValue: { type: 'string', default: 'A' } },
            },
            {
              '&if': "./kind === 'b'",
              properties: { bValue: { type: 'string', default: 'B' } },
            },
          ],
        },
      },
    } satisfies JSONSchema;

    it('keeps the seeded null after the initial branch settles, with the active branch mounted', async () => {
      const form = await renderForm(branchSchema, {
        defaultValue: { target: null },
      });

      expect(form.node('/target')?.value).toBeNull();
      expect(form.getValue()).toEqual({ target: null });
      expect(form.exists('/target/aValue')).toBe(true);
      expect(form.exists('/target/bValue')).toBe(false);
    });

    it('promotes to the selected branch when the user switches the discriminator', async () => {
      const form = await renderForm(branchSchema, {
        defaultValue: { target: null },
      });

      await form.selectOption('/target/kind', 'b');

      expect(form.getValue()).toEqual({ target: { kind: 'b', bValue: 'B' } });
      expect(form.exists('/target/bValue')).toBe(true);
      expect(form.exists('/target/aValue')).toBe(false);
    });

    it('validates clean when the null object is promoted inside the branch that settled while it was null', async () => {
      const form = await renderForm(branchSchema, {
        defaultValue: { target: null },
        validator: true,
      });
      expect(form.getValue()).toEqual({ target: null });

      // The oneOf index does not change here, so the branch marker the validator
      // needs must already have been recorded while the object was still null.
      await form.type('/target/aValue', 'typed');

      expect(form.getValue()).toEqual({
        target: { kind: 'a', aValue: 'typed' },
      });
      expect(await form.validate()).toEqual([]);
    });

    it('returns to the seeded null on reset after a branch switch', async () => {
      const form = await renderForm(branchSchema, {
        defaultValue: { target: null },
      });

      await form.selectOption('/target/kind', 'b');
      await form.reset();

      expect(form.getValue()).toEqual({ target: null });
      expect(form.exists('/target/aValue')).toBe(true);
    });
  });
});
