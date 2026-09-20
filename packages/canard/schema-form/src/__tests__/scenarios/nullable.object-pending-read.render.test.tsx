import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { StringNode } from '@/schema-form';
import { NodeEventType } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import { renderForm } from '../renderForm';

/**
 * Reading an object's value while a child's commit is still queued changes
 * nothing: the same writes give the same value, the same events and the same
 * injection whether or not anything — React's render included — read the
 * object in between.
 *
 * Null-contract clauses (ObjectNode DETAIL) ↔ cases in this file:
 * - S1 : none — `{}` vs `null` is covered by `nullable.render.test.tsx`
 * - S2 : "keeps a null seed … after mount", "keeps null when a dependency is typed"
 * - S3 : "keeps a null seed … after mount"
 * - S4 : none — blank state is covered by `nullable.object-blank-state.render.test.tsx`
 * - S5 : "promotes to what a never-null form holds"
 * - S6 : "promotes when the user types the value a derived field already shows"
 * - S7 : none — non-nullable assignment is covered by `nullable.render.test.tsx`
 */
describe('nullable.object-pending-read.render — reading an object changes nothing', () => {
  const nestedDerived = {
    type: 'object',
    properties: {
      quantity: { type: 'number', default: 2 },
      target: {
        type: ['object', 'null'],
        properties: {
          inner: {
            type: 'object',
            properties: {
              note: { type: 'string' },
              total: {
                type: 'number',
                computed: { derived: '(../../../quantity || 0) * 10' },
              },
            },
          },
        },
      },
    },
  } satisfies JSONSchema;

  /** Mounts the null seed and returns the settled form value. */
  const mountNullSeed = async (strictMode: boolean) => {
    const form = await renderForm(nestedDerived, {
      defaultValue: { target: null },
      strictMode,
    });
    await form.flush(20);
    return form.getValue();
  };

  for (const strictMode of [false, true]) {
    it(`keeps a null seed over a nested derived field after mount (strictMode=${strictMode})`, async () => {
      expect(await mountNullSeed(strictMode)).toEqual({
        quantity: 2,
        target: null,
      });
    });
  }

  /** Types a new quantity under the null seed and returns the settled form value. */
  const typeDependency = async () => {
    const form = await renderForm(nestedDerived, {
      defaultValue: { target: null },
    });
    await form.clear('/quantity');
    await form.type('/quantity', '5');
    await form.flush(20);
    return form.getValue();
  };

  it('keeps null when a dependency is typed', async () => {
    expect(await typeDependency()).toEqual({ quantity: 5, target: null });
  });

  it('promotes to what a never-null form holds', async () => {
    const seeded = await renderForm(nestedDerived, {
      defaultValue: { target: null },
    });
    await seeded.type('/target/inner/note', 'hi');
    await seeded.flush(20);
    const fresh = await renderForm(nestedDerived);
    await fresh.type('/target/inner/note', 'hi');
    await fresh.flush(20);

    expect(seeded.getValue()).toEqual(fresh.getValue());
    expect(seeded.getValue()).toEqual({
      quantity: 2,
      target: { inner: { note: 'hi', total: 20 } },
    });
  });

  it('promotes when the user types the value a derived field already shows', async () => {
    const form = await renderForm(nestedDerived, {
      defaultValue: { target: null },
    });
    await form.clear('/target/inner/total');
    await form.type('/target/inner/total', '20');
    await form.flush(20);

    expect(form.getValue()).toEqual({
      quantity: 2,
      target: { inner: { total: 20 } },
    });
  });

  const watched = {
    type: 'object',
    properties: {
      seed: { type: 'number', default: 1 },
      source: {
        type: 'object',
        properties: {
          note: { type: 'string', default: 'u' },
          total: {
            type: 'number',
            computed: { derived: '(../../seed || 0) * 10' },
          },
        },
      },
      watcher: { type: 'string', computed: { watch: ['../source'] } },
    },
  } satisfies JSONSchema;

  /** Types a new seed; with `read`, a subscriber reads the object inside the pending window. */
  const typeSeed = async (read: boolean) => {
    const form = await renderForm(watched);
    const source = form.node('/source');
    let updates = 0;
    source?.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateValue) updates++;
    });
    form.node('/source/total')?.subscribe(({ type }) => {
      if (read && type & NodeEventType.UpdateValue) void source?.value;
    });
    await form.clear('/seed');
    await form.type('/seed', '2');
    await form.flush(20);
    return {
      value: form.getValue(),
      updates,
      watched: form.node('/watcher')?.watchValues,
      errors: form.caughtErrors(),
    };
  };

  it('[parity] an object-path watcher sees the latest object whether or not the object was read', async () => {
    const quiet = await typeSeed(false);
    const read = await typeSeed(true);

    expect(quiet.watched).toEqual([{ note: 'u', total: 20 }]);
    expect(read).toEqual(quiet);
  });

  const injecting = {
    type: 'object',
    properties: {
      seed: { type: 'number', default: 1 },
      source: {
        type: 'object',
        injectTo: (value: { total?: number } | null) => ({
          '/target/mirror': value?.total,
        }),
        properties: {
          note: { type: 'string' },
          total: {
            type: 'number',
            computed: { derived: '(../../seed || 0) * 10' },
          },
        },
      },
      target: {
        type: ['object', 'null'],
        properties: { mirror: { type: 'number' } },
      },
    },
  } satisfies JSONSchema;

  /** Writes into the injecting object through its node; with `read`, the object is read in the same tick. */
  const writeIntoSource = async (read: boolean) => {
    const form = await renderForm(injecting, {
      defaultValue: { target: null },
    });
    const source = form.node('/source');
    await act(async () => {
      (form.node('/source/note') as StringNode).setValue('user');
      if (read) void source?.value;
    });
    await form.flush(20);
    return { value: form.getValue(), errors: form.caughtErrors() };
  };

  it('[parity] an intended write injects in its own settle whether or not the object was read', async () => {
    const quiet = await writeIntoSource(false);
    const read = await writeIntoSource(true);

    expect(quiet.value).toEqual({
      seed: 1,
      source: { note: 'user', total: 10 },
      target: { mirror: 10 },
    });
    expect(read).toEqual(quiet);
  });

  it('renders the null seed without a React warning', async () => {
    const form = await renderForm(nestedDerived, {
      defaultValue: { target: null },
    });
    await form.flush(20);

    expect(form.caughtErrors()).toEqual([]);
  });
});
