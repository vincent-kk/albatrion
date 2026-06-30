import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * Array mutation identity — render-vs-tree divergence suite (GAP-6/7/8).
 *
 * Schema mirrors the array stories (27.OptimizeArrayUsecase / 04.FromChildren):
 * an object with a single string-array property. Item terminals render with
 * `id="/items/<index>"` and a `[data-path="/items/<index>"]` wrapper, so the
 * rendered row set is observable independently of the node tree.
 *
 *  - GAP-6: append (`push`/addItem) + whole-array `setValue` (applyValue path,
 *           per-item publish suppressed) must yield the right rendered row count.
 *  - GAP-7: removing the middle item must leave the correct two values AND
 *           re-index the surviving rows' data-path.
 *  - GAP-8: reorder via `setValue` reorders values but destroys per-row identity
 *           (every row input remounts) — documented, not "fixed".
 */

const arraySchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { type: 'string' },
    },
  },
} satisfies JsonSchema;

/** All rendered item-row paths, e.g. ['/items/0', '/items/1'] in document order. */
const itemPaths = (form: { renderedPaths: () => string[] }): string[] =>
  form
    .renderedPaths()
    .filter((p) => /^\/items\/\d+$/.test(p))
    .sort();

describe('Array mutation identity (GAP-6/7/8)', () => {
  describe('push / addItem (GAP-6)', () => {
    it('addItem appends exactly one empty row to an empty array', async () => {
      const form = await renderForm(arraySchema, {
        defaultValue: { items: [] },
      });

      // Tree + DOM both start empty.
      expect(form.node('/items')?.value ?? []).toEqual([]);
      expect(itemPaths(form)).toEqual([]);

      await form.addItem('/items');

      // Tree: exactly one element appended.
      expect((form.node('/items')?.value as unknown[])?.length).toBe(1);
      // DOM: exactly one row, and its input is empty/default.
      expect(itemPaths(form)).toEqual(['/items/0']);
      expect(form.exists('/items/0')).toBe(true);
      expect(form.value('/items/0')).toBe('');
      expect(form.caughtErrors()).toEqual([]);
    });

    it('addItem appends one row while preserving the existing rows', async () => {
      const form = await renderForm(arraySchema, {
        defaultValue: { items: ['a', 'b'] },
      });

      expect(itemPaths(form)).toEqual(['/items/0', '/items/1']);
      expect(form.value('/items/0')).toBe('a');
      expect(form.value('/items/1')).toBe('b');

      await form.addItem('/items');

      // Tree grew by exactly one; existing values untouched.
      expect(form.node('/items')?.value).toEqual(['a', 'b', undefined]);
      // DOM: three rows, originals preserved, new one empty.
      expect(itemPaths(form)).toEqual(['/items/0', '/items/1', '/items/2']);
      expect(form.value('/items/0')).toBe('a');
      expect(form.value('/items/1')).toBe('b');
      expect(form.value('/items/2')).toBe('');
    });

    it('two addItem clicks add exactly two rows', async () => {
      const form = await renderForm(arraySchema, {
        defaultValue: { items: [] },
      });

      await form.addItem('/items');
      await form.addItem('/items');

      expect((form.node('/items')?.value as unknown[])?.length).toBe(2);
      expect(itemPaths(form)).toEqual(['/items/0', '/items/1']);
    });
  });

  describe('whole-array setValue / applyValue (GAP-6 suppressed per-item publish)', () => {
    it('setValue of a 3-item array renders three rows with the correct values', async () => {
      const form = await renderForm(arraySchema, {
        defaultValue: { items: [] },
      });

      await form.setValue({ items: ['x', 'y', 'z'] });

      // Tree settled to the new array.
      expect(form.node('/items')?.value).toEqual(['x', 'y', 'z']);
      expect(form.getValue()?.items).toEqual(['x', 'y', 'z']);
      // DOM: three rows with matching values (applyValue re-pushes per item with
      // updateChildren suppressed, then a single trailing emitChange).
      expect(itemPaths(form)).toEqual(['/items/0', '/items/1', '/items/2']);
      expect(form.value('/items/0')).toBe('x');
      expect(form.value('/items/1')).toBe('y');
      expect(form.value('/items/2')).toBe('z');
      expect(form.caughtErrors()).toEqual([]);
    });

    it('setValue to a shorter array reduces the rendered row count', async () => {
      const form = await renderForm(arraySchema, {
        defaultValue: { items: ['a', 'b', 'c'] },
      });

      expect(itemPaths(form)).toEqual(['/items/0', '/items/1', '/items/2']);

      await form.setValue({ items: ['only'] });

      expect(form.node('/items')?.value).toEqual(['only']);
      expect(itemPaths(form)).toEqual(['/items/0']);
      expect(form.value('/items/0')).toBe('only');
      expect(form.exists('/items/1')).toBe(false);
      expect(form.exists('/items/2')).toBe(false);
    });

    it('setValue to a longer array increases the rendered row count', async () => {
      const form = await renderForm(arraySchema, {
        defaultValue: { items: ['a'] },
      });

      expect(itemPaths(form)).toEqual(['/items/0']);

      await form.setValue({ items: ['a', 'b', 'c', 'd'] });

      expect(form.node('/items')?.value).toEqual(['a', 'b', 'c', 'd']);
      expect(itemPaths(form)).toEqual([
        '/items/0',
        '/items/1',
        '/items/2',
        '/items/3',
      ]);
      expect(form.value('/items/3')).toBe('d');
    });
  });

  describe('remove middle item (GAP-7)', () => {
    it('removing the middle of three leaves the correct two values', async () => {
      const form = await renderForm(arraySchema, {
        defaultValue: { items: ['a', 'b', 'c'] },
      });

      await form.removeItem('/items', 1);

      // Tree: the middle element is gone, indices re-labelled.
      expect(form.node('/items')?.value).toEqual(['a', 'c']);
      expect(form.node('/items/0')?.value).toBe('a');
      expect(form.node('/items/1')?.value).toBe('c');
      expect(form.node('/items/2')).toBeNull();

      // DOM: exactly two rows remain, values are the surviving two (not shifted
      // wrong nor duplicated).
      expect(itemPaths(form).length).toBe(2);
      const values = itemPaths(form).map((p) => form.value(p));
      expect(values.sort()).toEqual(['a', 'c']);
    });

    it('removing the middle re-indexes surviving rows to /items/0 and /items/1', async () => {
      const form = await renderForm(arraySchema, {
        defaultValue: { items: ['a', 'b', 'c'] },
      });

      await form.removeItem('/items', 1);

      // The node tree re-indexes (path /items/1 now holds 'c'); the rendered
      // rows must follow so each surviving input's data-path reflects its new
      // index. A regression that reuses the cached component without re-naming
      // would leave a stale /items/2 wrapper.
      expect(itemPaths(form)).toEqual(['/items/0', '/items/1']);
      expect(form.value('/items/0')).toBe('a');
      expect(form.value('/items/1')).toBe('c');
      expect(form.exists('/items/2')).toBe(false);
    });

    it('removing the first item leaves the last two values, re-indexed', async () => {
      const form = await renderForm(arraySchema, {
        defaultValue: { items: ['a', 'b', 'c'] },
      });

      await form.removeItem('/items', 0);

      expect(form.node('/items')?.value).toEqual(['b', 'c']);
      expect(itemPaths(form).length).toBe(2);
      const values = itemPaths(form).map((p) => form.value(p));
      expect(values.sort()).toEqual(['b', 'c']);
    });
  });

  describe('reorder via setValue (GAP-8 — identity destroyed)', () => {
    it('reorder reflects the new value ordering in both tree and DOM', async () => {
      const form = await renderForm(arraySchema, {
        defaultValue: { items: ['a', 'b', 'c'] },
      });

      await form.setValue({ items: ['c', 'b', 'a'] });

      expect(form.node('/items')?.value).toEqual(['c', 'b', 'a']);
      expect(form.value('/items/0')).toBe('c');
      expect(form.value('/items/1')).toBe('b');
      expect(form.value('/items/2')).toBe('a');
      expect(form.caughtErrors()).toEqual([]);
    });

    it('reorder remounts every row input (identity loss via mountOrdinal churn)', async () => {
      const form = await renderForm(arraySchema, {
        defaultValue: { items: ['a', 'b', 'c'] },
        instrument: true,
      });

      // Initial mount ordinals (first mount of each path).
      const before = [0, 1, 2].map((i) => form.mountOrdinal(`/items/${i}`));
      expect(before).toEqual([1, 1, 1]);

      await form.setValue({ items: ['c', 'b', 'a'] });

      // Values reordered correctly...
      expect(form.value('/items/0')).toBe('c');
      expect(form.value('/items/2')).toBe('a');
      // ...but there is no reorder primitive: applyValue clears + re-pushes,
      // minting brand-new keys, so EVERY row component remounts (ordinal
      // increments at every path). This documents the identity loss.
      const after = [0, 1, 2].map((i) => form.mountOrdinal(`/items/${i}`));
      expect(after).toEqual([2, 2, 2]);
    });

    it('reorder loses focus on the previously focused row', async () => {
      const form = await renderForm(arraySchema, {
        defaultValue: { items: ['a', 'b', 'c'] },
      });

      const focused = form.field('/items/1');
      focused?.focus();
      expect(document.activeElement).toBe(focused);

      await form.setValue({ items: ['c', 'b', 'a'] });

      // The original input element was unmounted by the clear+re-push, so focus
      // is not preserved across a reorder.
      expect(document.activeElement).not.toBe(focused);
      expect(form.value('/items/1')).toBe('b');
    });
  });
});
