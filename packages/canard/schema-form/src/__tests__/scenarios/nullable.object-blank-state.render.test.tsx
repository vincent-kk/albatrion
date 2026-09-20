import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@winglet/json-schema';

import { type FormHarness, renderForm } from '../renderForm';

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

/**
 * What a node was built with outlives a `null`: `defaultValue` does not move,
 * `resetSubtree()` brings the initial values back from whichever node it is
 * called on, and only then do later restores stop giving the blank form.
 */
describe('nullable.object-blank-state.render — the initial value after the object was null', () => {
  const schema = {
    type: 'object',
    properties: {
      target: {
        type: ['object', 'null'],
        properties: {
          kind: { type: 'string', enum: ['a', 'b'], default: 'a' },
          note: { type: 'string', default: 'N' },
        },
        oneOf: [
          {
            '&if': "./kind === 'a'",
            properties: { aValue: { type: 'string' } },
          },
          {
            '&if': "./kind === 'b'",
            properties: { bValue: { type: 'string', default: 'B' } },
          },
        ],
      },
    },
  } satisfies JSONSchema;
  const seed = { target: { kind: 'b', note: 'seeded', bValue: 'x' } };

  /** Renders the seeded form and takes `target` through `null` and back by typing. */
  const throughNull = async () => {
    const form = await renderForm(schema, { defaultValue: seed });
    await form.setValue({ target: null });
    await form.type('/target/note', 'typed');
    return form;
  };

  /** Resets the subtree of the node at `path` and lets the form settle. */
  const resetAt = async (form: FormHarness, path: string) => {
    await act(async () => form.node(path)?.resetSubtree());
    await form.flush(20);
  };

  /** Switches the branch away and back. */
  const roundTrip = async (form: FormHarness) => {
    await form.selectOption('/target/kind', 'a');
    await form.selectOption('/target/kind', 'b');
    return form.getValue();
  };

  it('[default-after-null] defaultValue is the same before, during and after null', async () => {
    const form = await renderForm(schema, { defaultValue: seed });
    const read = () => [
      form.node('/target')?.defaultValue,
      form.node('/target/note')?.defaultValue,
      form.node('/target/bValue')?.defaultValue,
    ];
    const before = read();
    await form.setValue({ target: null });
    const during = read();
    await form.type('/target/note', 'typed');

    expect(before).toEqual([seed.target, 'seeded', 'x']);
    expect(during).toEqual(before);
    expect(read()).toEqual(before);
  });

  it('[default-after-null] resetSubtree() on the object brings back what it was built with', async () => {
    const form = await throughNull();
    await resetAt(form, '/target');

    expect(form.getValue()).toEqual(seed);
    expect(form.value('/target/bValue')).toBe('x');
  });

  it('[default-after-null] resetSubtree() on a field brings back that field only', async () => {
    const form = await throughNull();
    await resetAt(form, '/target/note');

    expect(form.getValue()).toEqual({ target: { kind: 'a', note: 'seeded' } });
    expect(form.value('/target/note')).toBe('seeded');
  });

  it('[default-after-null] a branch restore stays blank while nothing was reset', async () => {
    const form = await throughNull();

    expect(await roundTrip(form)).toEqual({
      target: { kind: 'b', note: 'typed', bValue: 'B' },
    });
  });

  it('[default-after-null] a reset form round-trips like a form just rendered', async () => {
    const fresh = await renderForm(schema, { defaultValue: seed });
    const form = await throughNull();
    await resetAt(form, '/');

    expect(form.getValue()).toEqual(seed);
    expect(await roundTrip(form)).toEqual(await roundTrip(fresh));
  });
});
