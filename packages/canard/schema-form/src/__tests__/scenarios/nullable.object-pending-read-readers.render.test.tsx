import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { NumberNode, ObjectNode } from '@/schema-form';
import { NodeEventType, SetValueOption } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import { type FormHarness, renderForm } from '../renderForm';

/**
 * Who reads an object while a child's commit is pending does not matter. Each
 * case runs the same writes twice — once with one more reader of a given kind —
 * and expects the same value, the same object updates and the same watcher view.
 */
describe('nullable.object-pending-read-readers.render — every kind of reader leaves the result alone', () => {
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

  /** Writes a new seed through its node, lets `reader` run in the same tick, and reports what settles. */
  const writeSeed = async (reader: (form: FormHarness) => void) => {
    const form = await renderForm(watched);
    let updates = 0;
    form.node('/source')?.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateValue) updates++;
    });
    await act(async () => {
      (form.node('/seed') as NumberNode).setValue(2);
      reader(form);
    });
    await form.flush(20);
    return {
      value: form.getValue(),
      updates,
      watched: form.node('/watcher')?.watchValues,
      errors: form.caughtErrors(),
    };
  };

  it('[parity] FormHandle.getValue in the tick of a write', async () => {
    const quiet = await writeSeed(() => {});

    expect(quiet.value).toEqual({ seed: 2, source: { note: 'u', total: 20 } });
    expect(quiet.watched).toEqual([{ note: 'u', total: 20 }]);
    expect(await writeSeed((form) => void form.handle.getValue())).toEqual(
      quiet,
    );
  });

  it('[parity] FormHandle.validate in the tick of a write', async () => {
    const quiet = await writeSeed(() => {});

    expect(await writeSeed((form) => void form.handle.validate())).toEqual(
      quiet,
    );
  });

  it('[parity] a functional assignment builds on what a literal merge gives', async () => {
    const literal = await writeSeed((form) =>
      (form.node('/source') as ObjectNode).setValue(
        { note: 'f' },
        SetValueOption.Merge,
      ),
    );
    const functional = await writeSeed((form) =>
      (form.node('/source') as ObjectNode).setValue((previous) => ({
        ...previous,
        note: 'f',
      })),
    );

    expect(literal.value).toEqual({
      seed: 2,
      source: { note: 'f', total: 20 },
    });
    expect(functional.value).toEqual(literal.value);
    expect(functional.watched).toEqual(literal.watched);
  });

  /** A null seed over a nested derived field; `readsContext` makes the inject handler read its parent and root values. */
  const injecting = (readsContext: boolean) =>
    ({
      type: 'object',
      properties: {
        quantity: { type: 'number', default: 2 },
        source: {
          type: 'object',
          injectTo: (
            value: { total?: number } | null,
            context: { parentValue: unknown; rootValue: unknown },
          ) => {
            if (readsContext) void [context.parentValue, context.rootValue];
            return { '/target/inner/mirror': value?.total };
          },
          properties: {
            total: {
              type: 'number',
              computed: { derived: '(../../quantity || 0) * 10' },
            },
          },
        },
        target: {
          type: ['object', 'null'],
          properties: {
            inner: {
              type: 'object',
              properties: { mirror: { type: 'number' } },
            },
          },
        },
      },
    }) satisfies JSONSchema;

  /** Mounts the injecting form over a null seed, types a dependency and reports what settles. */
  const typeQuantity = async (
    schema: JSONSchema,
    options: Parameters<typeof renderForm>[1] = {},
  ) => {
    const form = await renderForm(schema, {
      defaultValue: { target: null },
      ...options,
    });
    await form.clear('/quantity');
    await form.type('/quantity', '5');
    await form.flush(20);
    return form.getValue();
  };

  it('[parity] an inject handler that reads its parent and root values', async () => {
    const quiet = await typeQuantity(injecting(false));

    expect(quiet).toEqual({ quantity: 5, source: { total: 50 }, target: null });
    expect(await typeQuantity(injecting(true))).toEqual(quiet);
  });

  it('[parity] StrictMode double render', async () => {
    const quiet = await typeQuantity(injecting(false));

    expect(await typeQuantity(injecting(false), { strictMode: true })).toEqual(
      quiet,
    );
  });

  it('[parity] virtualization defers the fields that would read', async () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const quiet = await typeQuantity(injecting(false));
    const deferred = await typeQuantity(injecting(false), {
      virtualization: { threshold: 2, eagerCount: 1 },
    });
    vi.unstubAllGlobals();

    expect(deferred).toEqual(quiet);
  });
});
