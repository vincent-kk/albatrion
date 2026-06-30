import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { SetValueOption } from '@/schema-form/core';

import { renderForm } from '../renderForm';

/**
 * Virtual node render scenarios (GAP-15).
 *
 * A `virtual` field aggregates real sibling fields. The load-bearing,
 * empirically-verified contract this suite pins is:
 *
 *   - The referenced REAL fields are skipped at the OBJECT level
 *     (`child.virtual === true` in getChildNodeMap) — they do NOT render a
 *     `[data-path]` wrapper as direct children of the object.
 *   - Instead the VIRTUAL node renders its own `[data-path="/<virtual>"]`
 *     wrapper (via FormTypeInputVirtual) and the real fields render NESTED
 *     inside it. So the virtual node's enabled-state gates the visibility of
 *     every field it references.
 *   - `node('/<virtual>').value` is the array aggregation of the referenced
 *     values; the object `getValue()` omits the virtual key entirely.
 *
 * NOTE: this contradicts the GAP-15 hypothesis ("virtual = tree-only, never
 * DOM"). The virtual path DOES render a `[data-path]` wrapper; it is the
 * referenced real fields that never render at the object level. DOM and tree
 * stay consistent throughout, so there is no product bug here.
 */
describe('virtual node DOM presence', () => {
  const periodSchema = {
    type: 'object',
    properties: {
      startDate: { type: 'string' },
      endDate: { type: 'string' },
    },
    virtual: { period: { fields: ['startDate', 'endDate'] } },
  } satisfies JsonSchema;

  it('renders a [data-path] wrapper for the virtual node with referenced fields nested inside', async () => {
    const form = await renderForm(periodSchema);

    // DOM: virtual node renders its own wrapper; referenced real fields render
    // nested inside it (not at the object level).
    expect(form.renderedPaths()).toEqual([
      '',
      '/period',
      '/startDate',
      '/endDate',
    ]);
    expect(form.exists('/period')).toBe(true);
    expect(form.exists('/startDate')).toBe(true);
    expect(form.exists('/endDate')).toBe(true);
    expect(form.wrapper('/period')?.contains(form.wrapper('/startDate'))).toBe(
      true,
    );
    expect(form.wrapper('/period')?.contains(form.wrapper('/endDate'))).toBe(
      true,
    );

    // Tree: virtual node exists with array aggregation; object value omits it.
    expect(form.node('/period')?.type).toBe('virtual');
    expect(form.node('/period')?.value).toEqual([undefined, undefined]);
    expect(form.getValue()).toEqual({});
  });

  it('does not render referenced real fields as direct object children', async () => {
    const form = await renderForm(periodSchema);

    // The startDate/endDate wrappers exist only as descendants of /period,
    // never as direct children of the object root wrapper.
    const root = form.wrapper('');
    const period = form.wrapper('/period');
    expect(root?.contains(period!)).toBe(true);

    // Both real fields live inside the virtual wrapper, and the real field
    // nodes are still present in the tree.
    expect(period?.querySelector('#\\/startDate')).not.toBeNull();
    expect(period?.querySelector('#\\/endDate')).not.toBeNull();
    expect(form.node('/startDate')?.type).toBe('string');
    expect(form.node('/endDate')?.type).toBe('string');
  });

  it('renders only the virtual wrapper when the virtual field owns a custom FormTypeInput', async () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      virtual: {
        user: {
          fields: ['name', 'age'],
          FormTypeInput: ({ value, onChange }: any) => (
            <input
              id="custom-user"
              value={value?.[0] ?? ''}
              onChange={(e) => onChange([e.target.value, value?.[1]])}
            />
          ),
        },
      },
    } satisfies JsonSchema;
    const form = await renderForm(schema);

    // DOM: only the virtual node renders; the referenced fields are NOT given
    // their own [data-path] wrappers (the custom input renders its own UI).
    expect(form.renderedPaths()).toEqual(['', '/user']);
    expect(form.exists('/name')).toBe(false);
    expect(form.exists('/age')).toBe(false);
    expect(form.field('custom-user')).not.toBeNull();

    // Tree: the referenced real-field nodes still exist.
    expect(form.node('/name')?.type).toBe('string');
    expect(form.node('/age')?.type).toBe('number');
    expect(form.node('/user')?.type).toBe('virtual');
  });
});

describe('virtual aggregation reflects edits', () => {
  const periodSchema = {
    type: 'object',
    properties: {
      startDate: { type: 'string' },
      endDate: { type: 'string' },
    },
    virtual: { period: { fields: ['startDate', 'endDate'] } },
  } satisfies JsonSchema;

  it('aggregates both real fields after editing them, while object value omits the virtual key', async () => {
    const form = await renderForm(periodSchema);

    await form.type('/startDate', '2021-01-01');
    await form.type('/endDate', '2021-01-02');

    // Tree: virtual aggregation reflects the combination.
    expect(form.node('/period')?.value).toEqual(['2021-01-01', '2021-01-02']);
    // Object value carries the real keys but NOT the virtual key.
    expect(form.getValue()).toEqual({
      startDate: '2021-01-01',
      endDate: '2021-01-02',
    });

    // DOM: both real inputs show their typed values.
    expect(form.value('/startDate')).toBe('2021-01-01');
    expect(form.value('/endDate')).toBe('2021-01-02');
  });

  it('updates only the edited slot of the aggregation', async () => {
    const form = await renderForm(periodSchema);

    await form.type('/startDate', '2021-01-01');

    // Tree: only the first slot is populated.
    expect(form.node('/period')?.value).toEqual(['2021-01-01', undefined]);
    expect(form.getValue()).toEqual({ startDate: '2021-01-01' });

    // DOM: first input filled, second still empty.
    expect(form.value('/startDate')).toBe('2021-01-01');
    expect(form.value('/endDate')).toBe('');
  });

  it('propagates a virtual setValue(Overwrite) to real fields and their DOM inputs', async () => {
    const form = await renderForm(periodSchema);
    const virtual = form.node('/period') as any;

    await act(async () => {
      virtual.setValue(['2025-01-01', '2026-01-01'], SetValueOption.Overwrite);
      await new Promise((r) => setTimeout(r, 0));
    });

    // Tree: aggregation and underlying real nodes updated.
    expect(form.node('/period')?.value).toEqual(['2025-01-01', '2026-01-01']);
    expect(form.node('/startDate')?.value).toBe('2025-01-01');
    expect(form.node('/endDate')?.value).toBe('2026-01-01');

    // DOM: uncontrolled inputs remounted via RequestRefresh and show new values.
    expect(form.value('/startDate')).toBe('2025-01-01');
    expect(form.value('/endDate')).toBe('2026-01-01');
  });

  it('clears referenced real fields when virtual is set to undefined(Overwrite)', async () => {
    const form = await renderForm(periodSchema, {
      defaultValue: { startDate: '2021-04-01', endDate: '2021-04-02' },
    });
    const virtual = form.node('/period') as any;

    await act(async () => {
      virtual.setValue(undefined, SetValueOption.Overwrite);
      await new Promise((r) => setTimeout(r, 0));
    });

    // Tree: real nodes cleared; aggregation holds two empty slots.
    expect(form.node('/startDate')?.value).toBeUndefined();
    expect(form.node('/endDate')?.value).toBeUndefined();
    expect(form.node('/period')?.value).toEqual([undefined, undefined]);
    expect(form.getValue()).toEqual({});

    // DOM: both inputs cleared.
    expect(form.value('/startDate')).toBe('');
    expect(form.value('/endDate')).toBe('');
  });
});

describe('virtual defaultValue priming', () => {
  const periodSchema = {
    type: 'object',
    properties: {
      startDate: { type: 'string' },
      endDate: { type: 'string' },
    },
    virtual: { period: { fields: ['startDate', 'endDate'] } },
  } satisfies JsonSchema;

  it('primes the aggregation and nested DOM from defaultValue (two-phase)', async () => {
    const form = await renderForm(periodSchema, {
      defaultValue: { startDate: '2021-04-01', endDate: '2021-04-02' },
      flushOnMount: false,
    });

    // Synchronous post-render snapshot: nested real fields already rendered
    // inside the virtual wrapper and primed from defaultValue.
    expect(form.renderedPaths()).toEqual([
      '',
      '/period',
      '/startDate',
      '/endDate',
    ]);
    expect(form.node('/period')?.value).toEqual(['2021-04-01', '2021-04-02']);
    expect(form.value('/startDate')).toBe('2021-04-01');
    expect(form.value('/endDate')).toBe('2021-04-02');

    await form.flush();

    // Settled snapshot: unchanged.
    expect(form.node('/period')?.value).toEqual(['2021-04-01', '2021-04-02']);
    expect(form.value('/startDate')).toBe('2021-04-01');
    expect(form.value('/endDate')).toBe('2021-04-02');
    expect(form.getValue()).toEqual({
      startDate: '2021-04-01',
      endDate: '2021-04-02',
    });
  });
});

describe('computed active gating', () => {
  const gatedSchema = {
    type: 'object',
    properties: {
      control: { type: 'string', enum: ['A', 'B'], default: 'A' },
      a1: { type: 'string', default: 'x' },
      a2: { type: 'string' },
    },
    virtual: {
      groupA: {
        fields: ['a1', 'a2'],
        computed: { active: '../control === "A"' },
      },
    },
  } satisfies JsonSchema;

  it('renders the active virtual wrapper and its nested fields', async () => {
    const form = await renderForm(gatedSchema);

    expect(form.renderedPaths()).toEqual([
      '',
      '/control',
      '/groupA',
      '/a1',
      '/a2',
    ]);
    expect(form.exists('/groupA')).toBe(true);
    expect(form.exists('/a1')).toBe(true);
    expect((form.node('/groupA') as any)?.enabled).toBe(true);
    expect(form.getValue()).toEqual({ control: 'A', a1: 'x' });
  });

  it('removes the virtual wrapper AND its nested real fields when deactivated, keeping the tree node', async () => {
    const form = await renderForm(gatedSchema);

    await form.setValue({ control: 'B' });

    // DOM: virtual wrapper and ALL its referenced fields gone (they only ever
    // render nested under the virtual wrapper).
    expect(form.renderedPaths()).toEqual(['', '/control']);
    expect(form.exists('/groupA')).toBe(false);
    expect(form.exists('/a1')).toBe(false);
    expect(form.exists('/a2')).toBe(false);

    // Tree: the virtual node still exists but is disabled; the deactivated
    // branch's value is stripped from the object value.
    expect(form.node('/groupA')).not.toBeNull();
    expect((form.node('/groupA') as any)?.enabled).toBe(false);
    expect(form.getValue()).toEqual({ control: 'B' });
  });

  it('remounts the previously hidden real-field inputs on re-activation', async () => {
    const form = await renderForm(gatedSchema, { instrument: true });
    const initialOrdinal = form.mountOrdinal('/a1');
    expect(initialOrdinal).toBe(1);

    await form.setValue({ control: 'B' });
    expect(form.exists('/a1')).toBe(false);

    await form.setValue({ control: 'A' });

    // DOM: input reappears with a higher mount ordinal (remounted, not reused).
    expect(form.exists('/a1')).toBe(true);
    expect(form.mountOrdinal('/a1')).toBeGreaterThan(initialOrdinal);
    // Re-activation does not re-inject the schema default; the replaced object
    // value left a1 empty, and the remounted DOM input mirrors that.
    expect(form.node('/a1')?.value).toBeUndefined();
    expect(form.value('/a1')).toBe('');
  });

  it('converges without infinite-loop errors across active toggles', async () => {
    const form = await renderForm(gatedSchema);

    await form.setValue({ control: 'B' });
    await form.setValue({ control: 'A' });
    await form.setValue({ control: 'B' });

    expect(form.caughtErrors()).toEqual([]);
    expect(form.renderedPaths()).toEqual(['', '/control']);
    expect(form.exists('/groupA')).toBe(false);
  });
});
