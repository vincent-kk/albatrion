import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * Runtime oneOf branch-switch render tests (GAP-3, GAP-4).
 *
 * GAP-3 — switching the discriminator (via userEvent <select> AND programmatic
 *   setValue) must REMOVE the old branch's `[data-path]` fields and ADD the new
 *   branch's, with no duplicates and no stale typed value left behind.
 * GAP-4 — switch away then back must REMOUNT the branch input (mountOrdinal
 *   increases) and show the reset/restored value, not the stale typed one.
 *
 * Discriminator (`enum` string) renders as an uncontrolled <select id={path}>;
 * branch fields render as uncontrolled <input id={path}> (string/number).
 * Schemas mirror stories/17.OneOf.stories.tsx.
 */

// Category-discriminated oneOf: one disjoint field per branch, plus a root
// field (`title`) that lives outside the composition.
const categorySchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['game', 'movie', 'console'],
      default: 'game',
    },
    title: { type: 'string' },
  },
  oneOf: [
    {
      '&if': "./category === 'game'",
      properties: { platform: { type: 'string' } },
    },
    {
      '&if': "./category === 'movie'",
      properties: { director: { type: 'string' } },
    },
    {
      '&if': "./category === 'console'",
      properties: { maker: { type: 'string', default: 'Sony' } },
    },
  ],
} satisfies JsonSchema;

// mode-discriminated oneOf used for instrument (remount) tests. `value` is a
// string in the text branch (with a default) and absent in the number branch.
const modeSchema = {
  type: 'object',
  properties: {
    mode: { type: 'string', enum: ['text', 'number'], default: 'text' },
  },
  oneOf: [
    {
      computed: { if: "./mode === 'text'" },
      properties: {
        name: { type: 'string' },
        value: { type: 'string', default: 'default text' },
      },
    },
    {
      computed: { if: "./mode === 'number'" },
      properties: {
        numValue: { type: 'number', default: 42 },
      },
    },
  ],
} satisfies JsonSchema;

const countPaths = (form: { renderedPaths: () => string[] }, path: string) =>
  form.renderedPaths().filter((p) => p === path).length;

describe('oneOf branch switch via userEvent discriminator (select)', () => {
  it('removes old-branch fields and adds new-branch fields when the discriminator select changes', async () => {
    const form = await renderForm(categorySchema);

    // Initial: default category 'game' → /platform active.
    expect(form.field('/category')?.tagName).toBe('SELECT');
    expect(form.value('/category')).toBe('game');
    expect(form.exists('/platform')).toBe(true);
    expect(form.exists('/director')).toBe(false);
    expect(form.exists('/maker')).toBe(false);
    // Inactive oneOf branch nodes persist in the tree but are not enabled.
    expect(form.node('/platform')?.enabled).toBe(true);
    expect(form.node('/director')?.enabled).toBe(false);

    await form.selectOption('/category', 'movie');

    // DOM: old branch removed, new branch added, exactly once.
    expect(form.exists('/platform')).toBe(false);
    expect(form.exists('/director')).toBe(true);
    expect(form.exists('/maker')).toBe(false);
    expect(countPaths(form, '/director')).toBe(1);
    // Tree agrees: old branch node disabled, new branch node enabled.
    expect(form.node('/platform')?.enabled).toBe(false);
    expect(form.node('/director')?.enabled).toBe(true);
    expect(form.getValue().category).toBe('movie');
    expect(form.getValue().platform).toBeUndefined();
  });

  it('clears a value typed into the old branch after switching away and back', async () => {
    const form = await renderForm(categorySchema);

    await form.type('/platform', 'PlayStation');
    expect(form.value('/platform')).toBe('PlayStation');
    expect(form.node('/platform')?.value).toBe('PlayStation');

    await form.selectOption('/category', 'movie');
    // Old-branch field gone from DOM and tree value dropped.
    expect(form.exists('/platform')).toBe(false);
    expect(form.getValue().platform).toBeUndefined();

    await form.selectOption('/category', 'game');
    // Back to game: field re-rendered with no stale 'PlayStation' value.
    expect(form.exists('/platform')).toBe(true);
    expect(form.value('/platform')).toBe('');
    expect(form.node('/platform')?.value).toBeUndefined();
  });

  it('switches across three branches leaving no duplicate or stale fields', async () => {
    const form = await renderForm(categorySchema);

    await form.selectOption('/category', 'movie');
    expect(form.exists('/platform')).toBe(false);
    expect(form.exists('/maker')).toBe(false);
    expect(countPaths(form, '/director')).toBe(1);

    await form.selectOption('/category', 'console');
    expect(form.exists('/platform')).toBe(false);
    expect(form.exists('/director')).toBe(false);
    expect(countPaths(form, '/maker')).toBe(1);
    // Branch default seeded on entry.
    expect(form.value('/maker')).toBe('Sony');
    expect(form.node('/maker')?.value).toBe('Sony');
    expect(form.getValue().maker).toBe('Sony');
  });
});

describe('oneOf branch switch via programmatic setValue', () => {
  it('switches branch via setValue and syncs DOM and tree together', async () => {
    const form = await renderForm(categorySchema);

    await form.setValue({ category: 'movie', director: 'Spielberg' });

    expect(form.exists('/platform')).toBe(false);
    expect(form.exists('/director')).toBe(true);
    expect(form.value('/director')).toBe('Spielberg');
    expect(form.value('/category')).toBe('movie');
    expect(form.node('/director')?.value).toBe('Spielberg');
    expect(form.getValue().platform).toBeUndefined();
  });

  it('does not duplicate fields when setValue switches branch repeatedly', async () => {
    const form = await renderForm(categorySchema);

    await form.setValue({ category: 'movie', director: 'A' });
    await form.setValue({ category: 'game', platform: 'B' });
    await form.setValue({ category: 'console' });

    expect(countPaths(form, '/maker')).toBe(1);
    expect(countPaths(form, '/platform')).toBe(0);
    expect(countPaths(form, '/director')).toBe(0);
    expect(form.exists('/platform')).toBe(false);
    expect(form.exists('/director')).toBe(false);
    expect(form.node('/maker')?.enabled).toBe(true);
    expect(form.node('/platform')?.enabled).toBe(false);
  });

  it('preserves a root field outside the composition across a branch switch', async () => {
    const form = await renderForm(categorySchema);

    await form.type('/title', 'My Title');
    expect(form.value('/title')).toBe('My Title');

    await form.setValue({
      category: 'movie',
      title: 'My Title',
      director: 'X',
    });
    // Root field still present and intact; branch swapped underneath it.
    expect(form.exists('/title')).toBe(true);
    expect(form.value('/title')).toBe('My Title');
    expect(form.node('/title')?.value).toBe('My Title');
    expect(form.exists('/director')).toBe(true);
    expect(form.exists('/platform')).toBe(false);
  });

  it('never throws INFINITE_LOOP_DETECTED while rapidly switching branches', async () => {
    const form = await renderForm(categorySchema);

    await form.setValue({ category: 'movie' });
    await form.setValue({ category: 'console' });
    await form.setValue({ category: 'game' });
    await form.setValue({ category: 'movie' });

    expect(form.caughtErrors()).toEqual([]);
    expect(form.exists('/director')).toBe(true);
    expect(countPaths(form, '/director')).toBe(1);
  });
});

describe('oneOf default-branch priming (two-phase)', () => {
  it('primes the node tree for a non-zero default-selected branch synchronously', async () => {
    const form = await renderForm(categorySchema, {
      defaultValue: { category: 'console' },
      flushOnMount: false,
    });

    // SYNCHRONOUS node-tree snapshot (before the microtask cascade drains):
    // the default-selected branch is already primed in the tree.
    expect(form.node('/maker')?.active).toBe(true);
    expect(form.node('/maker')?.value).toBe('Sony');

    await form.flush();

    // Settled: DOM now renders the branch and the default persists (no clobber).
    expect(form.exists('/maker')).toBe(true);
    expect(form.value('/maker')).toBe('Sony');
    expect(form.node('/maker')?.value).toBe('Sony');
    expect(form.getValue().category).toBe('console');
  });

  // BUG: with a default-selected non-zero oneOf branch the node tree is primed
  // synchronously (active=true, value='Sony') but the DOM omits the branch
  // field at first paint — `[data-path="/maker"]` only appears after the
  // microtask UpdateChildren cascade. DOM lags a correct tree (GAP-1).
  it.fails(
    'renders a default-selected non-zero oneOf branch field on first paint // BUG: branch field absent in DOM until microtask cascade despite primed tree',
    async () => {
      const form = await renderForm(categorySchema, {
        defaultValue: { category: 'console' },
        flushOnMount: false,
      });

      // Tree is correct synchronously...
      expect(form.node('/maker')?.active).toBe(true);
      // ...but the DOM has NOT rendered the branch field yet (this throws).
      expect(form.exists('/maker')).toBe(true);
    },
  );
});

describe('oneOf switch-back stale value (instrument / mountOrdinal)', () => {
  it('does not remount the branch input while the user types into it', async () => {
    const form = await renderForm(modeSchema, { instrument: true });

    const baseOrdinal = form.mountOrdinal('/value');
    expect(baseOrdinal).toBeGreaterThan(0);
    expect(form.value('/value')).toBe('default text');

    await form.type('/value', 'typed-A');

    expect(form.value('/value')).toBe('typed-A');
    expect(form.node('/value')?.value).toBe('typed-A');
    // Typing changes value via onChange but must NOT remount the input.
    expect(form.mountOrdinal('/value')).toBe(baseOrdinal);
  });

  it('removes the instrumented branch input from DOM and tree on switch-away', async () => {
    const form = await renderForm(modeSchema, { instrument: true });

    expect(form.exists('/value')).toBe(true);

    await form.setValue({ mode: 'number' });

    expect(form.exists('/value')).toBe(false);
    expect(form.node('/value')?.enabled).toBe(false);
    expect(form.exists('/numValue')).toBe(true);
    expect(form.value('/numValue')).toBe('42');
    expect(form.node('/numValue')?.value).toBe(42);
  });

  it('remounts the branch input and resets its DOM value to the schema default on switch-back', async () => {
    const form = await renderForm(modeSchema, { instrument: true });

    const baseOrdinal = form.mountOrdinal('/value');
    await form.type('/value', 'typed-A');
    expect(form.value('/value')).toBe('typed-A');

    await form.setValue({ mode: 'number' });
    expect(form.exists('/value')).toBe(false);

    await form.setValue({ mode: 'text' });

    // Re-entered the text branch: input re-mounted (fresh ordinal) and shows the
    // reset/default value, NOT the stale 'typed-A' from before the switch-away.
    expect(form.exists('/value')).toBe(true);
    expect(form.mountOrdinal('/value')).toBeGreaterThan(baseOrdinal);
    expect(form.value('/value')).toBe('default text');
    expect(form.node('/value')?.value).toBe('default text');
  });
});
