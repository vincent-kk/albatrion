import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * anyOf multi-branch render scenarios (GAP-5).
 *
 * anyOf branches activate independently via `computed.if`; several can be
 * active at once. The node tree rebuilds `__children__` by iterating the
 * parent's property keys and resolving each through
 * `anyOfChildNodeMaps.find(map => map.has(k))` — the first active branch map
 * that owns the key wins (`BranchStrategy.__processChildren__`).
 *
 * Two structural facts shape these tests:
 *   1. anyOf branch keys are mutually exclusive: `getCompositionNodeMapList`
 *      throws `COMPOSITION_PROPERTY_EXCLUSIVENESS_REDEFINITION` if two anyOf
 *      branches declare the same property key. So a *literal* overlapping key
 *      cannot be constructed — the "first active branch" resolution is always
 *      unambiguous. The reachable form of GAP-5 is therefore a partial
 *      change of the active *index set* over distinct keys, which is what the
 *      membership-toggle and multi-active groups exercise.
 *   2. Rendered children always follow the parent's property-key declaration
 *      order, independent of the order branches were activated in.
 *
 * Every test asserts BOTH the rendered DOM (`[data-path]` presence + the
 * uncontrolled input `.value`) AND the node tree (`node(path).value` /
 * `getValue()`) for the active branch set.
 */

// All-string branch values keep DOM value assertions uniform and let the
// instrumented inputs cover every terminal.
const multiBranchSchema = {
  type: 'object',
  properties: {
    showA: { type: 'boolean', default: true },
    showB: { type: 'boolean', default: false },
    showC: { type: 'boolean', default: false },
  },
  anyOf: [
    {
      computed: { if: './showA === true' },
      properties: { valueA: { type: 'string', default: 'A-def' } },
    },
    {
      computed: { if: './showB === true' },
      properties: { valueB: { type: 'string', default: 'B-def' } },
    },
    {
      computed: { if: './showC === true' },
      properties: { valueC: { type: 'string', default: 'C-def' } },
    },
  ],
} satisfies JsonSchema;

describe('composition/anyOf render — initial active branches on mount', () => {
  // GAP-1: priming snaps the active-branch node maps so the NODE TREE is
  // correct synchronously, but React's first `useState(node.children)`
  // snapshot does not include the anyOf branch child — so the field is absent
  // from the DOM at first paint and only appears after the microtask cascade.
  // The node tree is verified correct at the same synchronous instant, which
  // makes this a true DOM-vs-tree divergence (not a deferred-tree artifact).
  it.fails(
    'primes a default-active anyOf branch into the DOM at first paint // BUG: GAP-1 anyOf branch field absent from synchronous DOM while node tree already holds its value',
    async () => {
      const form = await renderForm(multiBranchSchema, { flushOnMount: false });

      // Node tree is already correct at the synchronous snapshot.
      expect(form.node('/valueA')?.value).toBe('A-def');
      expect(form.getValue()).toMatchObject({ showA: true, valueA: 'A-def' });

      // ...but the DOM has not rendered the branch field yet (the divergence).
      expect(form.exists('/valueA')).toBe(true);
    },
  );

  it('settles the single default-active branch into the DOM after the cascade', async () => {
    const form = await renderForm(multiBranchSchema, { flushOnMount: false });

    // Synchronous: tree correct, DOM branch field not yet committed.
    expect(form.node('/valueA')?.value).toBe('A-def');
    expect(form.exists('/valueA')).toBe(false);

    await form.flush();

    // Settled: DOM and node tree agree on the active set.
    expect(form.exists('/valueA')).toBe(true);
    expect(form.value('/valueA')).toBe('A-def');
    expect(form.exists('/valueB')).toBe(false);
    expect(form.exists('/valueC')).toBe(false);
    expect(form.node('/valueA')?.value).toBe('A-def');
    expect(form.getValue()).toMatchObject({ showA: true, valueA: 'A-def' });
    expect(form.getValue().valueB).toBeUndefined();
    expect(form.getValue().valueC).toBeUndefined();
  });

  it('settles two default-active branches together after the cascade', async () => {
    const form = await renderForm(multiBranchSchema, {
      defaultValue: { showA: true, showB: true },
      flushOnMount: false,
    });

    // Synchronous: both branch values are in the tree before the DOM commits.
    expect(form.node('/valueA')?.value).toBe('A-def');
    expect(form.node('/valueB')?.value).toBe('B-def');

    await form.flush();

    expect(form.exists('/valueA')).toBe(true);
    expect(form.exists('/valueB')).toBe(true);
    expect(form.exists('/valueC')).toBe(false);
    expect(form.value('/valueA')).toBe('A-def');
    expect(form.value('/valueB')).toBe('B-def');
    expect(form.getValue()).toMatchObject({
      showA: true,
      showB: true,
      valueA: 'A-def',
      valueB: 'B-def',
    });
    expect(form.getValue().valueC).toBeUndefined();
  });
});

describe('composition/anyOf render — toggling branch membership', () => {
  it('adds only the toggled branch field; the active branch persists', async () => {
    const form = await renderForm(multiBranchSchema);

    expect(form.exists('/valueA')).toBe(true);
    expect(form.exists('/valueB')).toBe(false);

    await form.toggle('/showB');

    // Only valueB joins; valueA untouched, valueC still inactive.
    expect(form.checked('/showB')).toBe(true);
    expect(form.exists('/valueB')).toBe(true);
    expect(form.value('/valueB')).toBe('B-def');
    expect(form.exists('/valueA')).toBe(true);
    expect(form.value('/valueA')).toBe('A-def');
    expect(form.exists('/valueC')).toBe(false);
    expect(form.getValue()).toMatchObject({ valueA: 'A-def', valueB: 'B-def' });
    expect(form.node('/valueB')?.value).toBe('B-def');
  });

  it('does not reset an already-active branch value when another branch activates', async () => {
    const form = await renderForm(multiBranchSchema);

    await form.type('/valueA', 'edited-A');
    expect(form.value('/valueA')).toBe('edited-A');

    await form.toggle('/showB');

    // valueA keeps the user-typed value (not remounted/reset) ...
    expect(form.value('/valueA')).toBe('edited-A');
    expect(form.node('/valueA')?.value).toBe('edited-A');
    // ... while valueB enters with its default.
    expect(form.exists('/valueB')).toBe(true);
    expect(form.value('/valueB')).toBe('B-def');
    expect(form.getValue()).toMatchObject({
      valueA: 'edited-A',
      valueB: 'B-def',
    });
  });

  it('removes only the deactivated branch field; siblings remain intact', async () => {
    const form = await renderForm(multiBranchSchema);

    await form.toggle('/showB'); // A + B active
    expect(form.exists('/valueB')).toBe(true);

    await form.toggle('/showA'); // deactivate A only

    expect(form.exists('/valueA')).toBe(false);
    expect(form.exists('/valueB')).toBe(true);
    expect(form.value('/valueB')).toBe('B-def');
    expect(form.getValue().valueA).toBeUndefined();
    expect(form.getValue()).toMatchObject({ valueB: 'B-def' });
    expect(form.node('/valueB')?.value).toBe('B-def');
  });

  it('reseeds the schema default when a deactivated branch is re-activated', async () => {
    const form = await renderForm(multiBranchSchema);

    await form.type('/valueA', 'edited-A');
    expect(form.value('/valueA')).toBe('edited-A');

    await form.toggle('/showA'); // off — valueA removed
    expect(form.exists('/valueA')).toBe(false);

    await form.toggle('/showA'); // on — valueA re-enters

    expect(form.exists('/valueA')).toBe(true);
    // Re-entry reseeds the schema default, not the prior edit.
    expect(form.value('/valueA')).toBe('A-def');
    expect(form.node('/valueA')?.value).toBe('A-def');
  });

  it('does not remount a persisting branch input when an unrelated branch toggles', async () => {
    const form = await renderForm(multiBranchSchema, { instrument: true });

    const before = form.mountOrdinal('/valueA');
    expect(Number.isNaN(before)).toBe(false);

    await form.toggle('/showB'); // activate an unrelated branch

    // valueA's input is reused (same ordinal), valueB freshly mounted.
    expect(form.mountOrdinal('/valueA')).toBe(before);
    expect(form.exists('/valueB')).toBe(true);
    expect(form.node('/valueA')?.value).toBe('A-def');
  });
});

describe('composition/anyOf render — multi-active resolution & ordering', () => {
  const countPath = (form: { container: HTMLElement }, path: string) =>
    form.container.querySelectorAll(`[data-path="${path}"]`).length;

  it('renders every simultaneously-active branch field, each bound to its own branch node', async () => {
    const form = await renderForm(multiBranchSchema, {
      defaultValue: { showA: true, showB: true, showC: true },
    });

    // Each key resolves to exactly one branch node (no duplicate components).
    expect(countPath(form, '/valueA')).toBe(1);
    expect(countPath(form, '/valueB')).toBe(1);
    expect(countPath(form, '/valueC')).toBe(1);

    // DOM values and node-tree values agree per active branch.
    expect(form.value('/valueA')).toBe('A-def');
    expect(form.value('/valueB')).toBe('B-def');
    expect(form.value('/valueC')).toBe('C-def');
    expect(form.node('/valueA')?.value).toBe('A-def');
    expect(form.node('/valueB')?.value).toBe('B-def');
    expect(form.node('/valueC')?.value).toBe('C-def');
    expect(form.getValue()).toMatchObject({
      valueA: 'A-def',
      valueB: 'B-def',
      valueC: 'C-def',
    });

    // Editing one active branch leaves the others' values independent.
    await form.type('/valueB', 'edited-B');
    expect(form.value('/valueB')).toBe('edited-B');
    expect(form.value('/valueA')).toBe('A-def');
    expect(form.value('/valueC')).toBe('C-def');
    expect(form.node('/valueB')?.value).toBe('edited-B');
  });

  it('keeps rendered branch order by property-key declaration, not activation order', async () => {
    const form = await renderForm(multiBranchSchema);

    // Activate branches in reverse declaration order.
    await form.toggle('/showC');
    await form.toggle('/showB');

    const order = form
      .renderedPaths()
      .filter((p) => p === '/valueA' || p === '/valueB' || p === '/valueC');

    // __processChildren__ iterates __propertyKeys__, so order is A, B, C.
    expect(order).toEqual(['/valueA', '/valueB', '/valueC']);
    expect(form.value('/valueA')).toBe('A-def');
    expect(form.value('/valueB')).toBe('B-def');
    expect(form.value('/valueC')).toBe('C-def');
    expect(form.getValue()).toMatchObject({
      valueA: 'A-def',
      valueB: 'B-def',
      valueC: 'C-def',
    });
  });

  it('rejects anyOf branches that redeclare the same key, so overlap is never ambiguous', async () => {
    // The gap analysis assumed a key shared by two active anyOf branches; the
    // library forbids it at construction time, which is precisely why the
    // first-active-branch resolution can never face a real ambiguity.
    const duplicateKeySchema = {
      type: 'object',
      properties: {
        p: { type: 'boolean', default: true },
        q: { type: 'boolean', default: false },
      },
      anyOf: [
        {
          computed: { if: './p === true' },
          properties: { shared: { type: 'string', default: 'from-P' } },
        },
        {
          computed: { if: './q === true' },
          properties: { shared: { type: 'string', default: 'from-Q' } },
        },
      ],
    } satisfies JsonSchema;

    const form = await renderForm(duplicateKeySchema);

    // Construction is rejected: neither the DOM nor the node tree exposes the
    // duplicated key, so no "which branch?" divergence is possible.
    expect(form.exists('/shared')).toBe(false);
    expect(form.node('/shared')).toBeNull();
    expect(form.getValue()).toBeUndefined();
    expect(form.renderedPaths()).not.toContain('/shared');
  });
});
