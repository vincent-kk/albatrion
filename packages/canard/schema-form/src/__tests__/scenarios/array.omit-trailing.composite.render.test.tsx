/**
 * omitTrailing composite scenarios — feature-intersection surfaces
 *
 * Stacks omitTrailing with the mechanisms that most often break each other:
 * one setValue that both selects a oneOf/anyOf branch AND hydrates nested
 * arrays inside it, if/then/else required over injected values, and injectTo
 * wiring in both directions (into a trimming array, and mirroring out of one).
 * Equivalent manual demos live in stories/41.OmitTrailing.stories.tsx.
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@/schema-form/types';

import { renderForm } from '../renderForm';

const INNER_TRIMMED = {
  type: 'array',
  items: { type: 'number' },
  options: { omitTrailing: true },
} as const;

const oneOfNestedSchema = {
  type: 'object',
  properties: {
    disc: { type: 'string', enum: ['a', 'b'] },
  },
  oneOf: [
    {
      computed: { if: "./disc === 'a'" },
      properties: {
        matrix: { type: 'array', items: INNER_TRIMMED },
      },
    },
    {
      computed: { if: "./disc === 'b'" },
      properties: { other: { type: 'string' } },
    },
  ],
} as JsonSchema;

describe('array omitTrailing × composite surfaces (render)', () => {
  it('selects a oneOf branch and hydrates nested trimmed VALUES in ONE setValue', async () => {
    const form = await renderForm(oneOfNestedSchema);
    await form.setValue({
      disc: 'a',
      matrix: [
        [1, undefined],
        [undefined, 2, undefined],
      ],
    });
    expect(form.getValue()?.matrix).toEqual([[1], [undefined, 2]]);
    expect(form.exists('/matrix/0/0')).toBe(true);
    expect(form.exists('/matrix/1/1')).toBe(true);
  });

  it.fails('preserves trailing empty inputs when the same setValue activates the branch // BUG: the oneOf restore re-applies the parent-composed (already trimmed) value as child state, so the trailing empty item nodes are dropped (inner children 1·2 instead of 2·3); same root cause as the minItems refill issue — the branch stash consumes the output channel instead of raw state', async () => {
    const form = await renderForm(oneOfNestedSchema);
    await form.setValue({
      disc: 'a',
      matrix: [
        [1, undefined],
        [undefined, 2, undefined],
      ],
    });
    expect(form.exists('/matrix/0/1')).toBe(true);
    expect(form.exists('/matrix/1/2')).toBe(true);
  });

  it('re-injects cleanly after a branch round-trip (no stale nested values)', async () => {
    const form = await renderForm(oneOfNestedSchema);
    await form.setValue({ disc: 'a', matrix: [[1, undefined]] });
    expect(form.getValue()?.matrix).toEqual([[1]]);
    await form.setValue({ disc: 'b' });
    expect(form.getValue()?.matrix).toBeUndefined();
    await form.setValue({ disc: 'a', matrix: [[3, undefined]] });
    expect(form.getValue()?.matrix).toEqual([[3]]);
  });

  it('characterizes the hydration vs emission split for an all-empty inner array (anyOf, outer+inner trimming)', async () => {
    // Hydration snapshots read inner.normalizedValue (trim only) → an
    // all-empty inner array lands as []; a trailing [] is NOT undefined, so
    // the outer omitTrailing keeps it. A later interactive change to that
    // inner array flows through the propagation chain (trim → omitEmpty) and
    // collapses it to undefined, which the outer trim then removes. Both
    // stances are pinned here; the split predates omitTrailing (omitEmpty
    // hydration behaves the same) and is reported as a design note.
    const anyOfNestedSchema = {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['list', 'none'] },
      },
      anyOf: [
        {
          computed: { if: "./mode === 'list'" },
          properties: {
            matrix: {
              type: 'array',
              items: INNER_TRIMMED,
              options: { omitTrailing: true },
            },
          },
        },
        {
          computed: { if: "./mode === 'none'" },
          properties: { note: { type: 'string' } },
        },
      ],
    } as JsonSchema;
    const form = await renderForm(anyOfNestedSchema);
    await form.setValue({
      mode: 'list',
      matrix: [[1, undefined], [undefined, undefined]],
    });
    expect(form.getValue()?.matrix).toEqual([[1], []]);
    expect(form.caughtErrors()).toEqual([]);
  });

  it('lets if/then/else required judge an injected nested value', async () => {
    const ifThenElseNestedSchema = {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['movie', 'game'] },
        matrix: { type: 'array', items: INNER_TRIMMED },
      },
      if: { properties: { category: { enum: ['movie'] } } },
      then: { required: ['matrix'] },
      else: {},
    } as JsonSchema;
    const form = await renderForm(ifThenElseNestedSchema, { validator: true });
    await form.setValue({ category: 'movie' });
    const missingErrors = await form.validate();
    expect(
      missingErrors.some(
        (error) =>
          error.keyword === 'required' &&
          String(error.dataPath).includes('matrix'),
      ),
    ).toBe(true);
    await form.setValue({ category: 'movie', matrix: [[1, undefined]] });
    const filledErrors = await form.validate();
    expect(
      filledErrors.some(
        (error) =>
          error.keyword === 'required' &&
          String(error.dataPath).includes('matrix'),
      ),
    ).toBe(false);
    expect(form.getValue()?.matrix).toEqual([[1]]);
  });

  it('keeps empty inputs when injectTo writes a trailing-undefined array', async () => {
    const injectIntoSchema = {
      type: 'object',
      properties: {
        source: {
          type: 'string',
          injectTo: (value: string) => ({
            '../arr': [value, undefined, undefined],
          }),
        },
        arr: {
          type: 'array',
          items: { type: 'string' },
          options: { omitTrailing: true },
        },
      },
    } as JsonSchema;
    const form = await renderForm(injectIntoSchema);
    await form.type('/source', 'x');
    expect(form.getValue()?.arr).toEqual(['x']);
    expect(form.exists('/arr/1')).toBe(true);
    expect(form.exists('/arr/2')).toBe(true);
  });

  it('characterizes injectTo receiving the RAW source value (not the normalized one)', async () => {
    // The injectTo handler reads this.value (AbstractNode), so a trimming
    // array hands its handler the raw [1, u, u] — the mirror target then
    // holds and emits the untrimmed copy. Pinned as the current contract;
    // whether injectTo should receive normalizedValue is an open design
    // question reported to the owner.
    const mirrorSchema = {
      type: 'object',
      properties: {
        arr: {
          type: 'array',
          items: { type: 'number' },
          options: { omitTrailing: true },
          injectTo: (value: number[]) => ({ '../mirror': value }),
        },
        mirror: { type: 'array', items: { type: 'number' } },
      },
    } as JsonSchema;
    const form = await renderForm(mirrorSchema);
    await form.setValue({ arr: [1, undefined, undefined] });
    expect(form.getValue()?.arr).toEqual([1]);
    expect(form.getValue()?.mirror).toEqual([1, undefined, undefined]);
  });

  it('characterizes injectTo branch-flip timing: same-round nested writes skip, the next round applies', async () => {
    // Injection targets resolve at injection time; a field that only becomes
    // addressable because THIS round flips the discriminator is not found,
    // so its write is silently skipped. The next injection round (branch now
    // active) applies normally. Pre-existing injectTo semantics, unrelated
    // to omitTrailing — pinned here because composite users will hit it.
    const flipAndFillSchema = {
      type: 'object',
      properties: {
        trigger: {
          type: 'string',
          injectTo: (value: string) =>
            value.startsWith('go')
              ? { '/disc': 'a', '/matrix': [[1, undefined]] }
              : null,
        },
        disc: { type: 'string', enum: ['a', 'b'], default: 'b' },
      },
      oneOf: [
        {
          computed: { if: "./disc === 'a'" },
          properties: {
            matrix: { type: 'array', items: INNER_TRIMMED },
          },
        },
        {
          computed: { if: "./disc === 'b'" },
          properties: { other: { type: 'string' } },
        },
      ],
    } as JsonSchema;
    const form = await renderForm(flipAndFillSchema);
    await form.type('/trigger', 'go');
    await form.flush(10);
    expect(form.getValue()?.disc).toBe('a');
    expect(form.getValue()?.matrix).toBeUndefined();
    await form.type('/trigger', 'go2');
    await form.flush(10);
    expect(form.getValue()?.matrix).toEqual([[1]]);
  });

  it('stays convergent across composite injection round-trips', async () => {
    const form = await renderForm(oneOfNestedSchema);
    await form.setValue({ disc: 'a', matrix: [[1, undefined]] });
    await form.setValue({ disc: 'b' });
    await form.setValue({ disc: 'a', matrix: [[2, undefined], [3]] });
    await form.setValue({ disc: 'a', matrix: [[2, undefined], [3]] });
    expect(form.getValue()?.matrix).toEqual([[2], [3]]);
    expect(form.caughtErrors()).toEqual([]);
  });
});
