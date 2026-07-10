import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { type FormHarness, renderForm } from '../renderForm';

/**
 * Render-level virtualization (deferred mount) tests — `virtualization` prop.
 *
 * Contract under test (issue #319):
 *   - Branches with `children.length >= threshold` render children beyond
 *     `eagerCount` as placeholders instead of mounting the real field subtree.
 *     Placeholders share the mounted wrapper's identity attribute
 *     (`data-path`) plus a `data-deferred` state marker, so `exists()`
 *     (mounted-only) stays FALSE until reveal while `deferred()` is TRUE.
 *   - Reveal triggers: IntersectionObserver intersection, idle backfill,
 *     RequestFocus/RequestSelect commands (with post-mount replay). Reveal is
 *     one-way (defer-once).
 *   - The node tree is fully alive regardless: values, validation and
 *     structural events are unaffected by deferral.
 *   - Once a node is revealed it stays eager across ChildComponent cache
 *     rebuilds (array renumbering) — the VirtualizationManager reveal ledger.
 *
 * jsdom has neither IntersectionObserver nor requestIdleCallback, so both are
 * stubbed per-file; reveals are driven manually (inside `act`).
 */

class MockIntersectionObserver {
  public static instances: MockIntersectionObserver[] = [];
  public readonly observed = new Set<Element>();
  constructor(
    public readonly callback: IntersectionObserverCallback,
    public readonly options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this);
  }
  observe(element: Element) {
    this.observed.add(element);
  }
  unobserve(element: Element) {
    this.observed.delete(element);
  }
  disconnect() {
    this.observed.clear();
  }
  intersect(...elements: Element[]) {
    const entries = elements
      .filter((target) => this.observed.has(target))
      .map(
        (target) =>
          ({ target, isIntersecting: true }) as IntersectionObserverEntry,
      );
    if (entries.length > 0)
      this.callback(entries, this as unknown as IntersectionObserver);
  }
}

type IdleCallback = (deadline: {
  didTimeout: boolean;
  timeRemaining: () => number;
}) => void;

const idleQueue: IdleCallback[] = [];

/** Reveal the placeholder at `path` as if it intersected the viewport. */
const intersect = async (form: FormHarness, path: string) => {
  const element = form.container.querySelector(
    `[data-path="${path}"][data-deferred]`,
  );
  if (!element) throw new Error(`intersect: no placeholder at "${path}"`);
  await act(async () => {
    for (const instance of MockIntersectionObserver.instances)
      instance.intersect(element);
  });
};

/** Run every scheduled idle callback (one backfill slice each). */
const flushIdle = async () => {
  await act(async () => {
    const batch = idleQueue.splice(0);
    for (const callback of batch)
      callback({ didTimeout: false, timeRemaining: () => 50 });
  });
};

const flatSchema = (
  count: number,
  overrides: Record<string, object> = {},
): JsonSchema => ({
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: count }, (_, index) => {
      const name = `f${String(index).padStart(2, '0')}`;
      return [
        name,
        { type: 'string', default: `v${index}`, ...(overrides[name] ?? {}) },
      ];
    }),
  ),
});

const arraySchema: JsonSchema = {
  type: 'object',
  properties: { items: { type: 'array', items: { type: 'string' } } },
};

const items = (count: number) =>
  Array.from({ length: count }, (_, index) => `v${index}`);

const VIRTUALIZATION = {
  threshold: 10,
  eagerCount: 3,
  backfill: 'none',
} as const;

describe('deferred-mount (virtualization)', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    idleQueue.length = 0;
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.stubGlobal('requestIdleCallback', (callback: IdleCallback) => {
      idleQueue.push(callback);
      return idleQueue.length;
    });
    vi.stubGlobal('cancelIdleCallback', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('initial gating', () => {
    it('mounts eagerCount fields and defers the rest as placeholders that survive extra flushes (backfill none)', async () => {
      const form = await renderForm(flatSchema(20), {
        virtualization: VIRTUALIZATION,
      });
      expect(form.exists('/f00')).toBe(true);
      expect(form.exists('/f02')).toBe(true);
      expect(form.value('/f02')).toBe('v2');
      expect(form.exists('/f03')).toBe(false);
      expect(form.deferred('/f03')).toBe(true);
      expect(form.deferredPaths()).toHaveLength(17);
      await form.flush(10);
      expect(form.deferredPaths()).toHaveLength(17);
      expect(form.caughtErrors()).toEqual([]);
    });

    it('does not gate a branch below the threshold', async () => {
      const form = await renderForm(flatSchema(5), {
        virtualization: VIRTUALIZATION,
      });
      expect(form.deferredPaths()).toHaveLength(0);
      expect(form.exists('/f04')).toBe(true);
    });

    it('renders no placeholders at all when virtualization is off', async () => {
      const form = await renderForm(flatSchema(20));
      expect(form.deferredPaths()).toHaveLength(0);
      expect(form.exists('/f19')).toBe(true);
    });
  });

  describe('reveal triggers', () => {
    it('reveals a field when its placeholder intersects the viewport, exactly once', async () => {
      const form = await renderForm(flatSchema(20), {
        virtualization: VIRTUALIZATION,
      });
      await intersect(form, '/f05');
      expect(form.exists('/f05')).toBe(true);
      expect(form.deferred('/f05')).toBe(false);
      expect(form.value('/f05')).toBe('v5');
      expect(form.deferredPaths()).toHaveLength(16);
    });

    it('idle backfill reveals every deferred field', async () => {
      const form = await renderForm(flatSchema(20), {
        virtualization: { ...VIRTUALIZATION, backfill: 'idle' },
      });
      expect(form.deferredPaths()).toHaveLength(17);
      await flushIdle();
      expect(form.deferredPaths()).toHaveLength(0);
      expect(form.exists('/f19')).toBe(true);
      expect(form.value('/f19')).toBe('v19');
      expect(form.caughtErrors()).toEqual([]);
    });

    it('handle.focus(path) force-reveals the field and focuses its input (command replay)', async () => {
      const form = await renderForm(flatSchema(20), {
        virtualization: VIRTUALIZATION,
      });
      expect(form.deferred('/f15')).toBe(true);
      await act(async () => {
        form.handle.focus('/f15');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(form.exists('/f15')).toBe(true);
      expect(form.deferred('/f15')).toBe(false);
      expect(document.activeElement).toBe(form.field('/f15'));
    });

    it('a value set while deferred appears in the DOM on reveal', async () => {
      const form = await renderForm(flatSchema(20), {
        virtualization: VIRTUALIZATION,
      });
      await form.setValue({ f10: 'updated' });
      expect(form.deferred('/f10')).toBe(true);
      expect(form.node('/f10')?.value).toBe('updated');
      await intersect(form, '/f10');
      expect(form.value('/f10')).toBe('updated');
    });
  });

  describe('node-tree consistency while deferred', () => {
    it('getValue/onChange include values of deferred fields', async () => {
      const form = await renderForm(flatSchema(20), {
        virtualization: VIRTUALIZATION,
      });
      expect(form.deferred('/f19')).toBe(true);
      expect(form.getValue().f19).toBe('v19');
      expect(form.lastValue().f19).toBe('v19');
    });

    it('validate() reports errors for deferred fields', async () => {
      const form = await renderForm(
        flatSchema(20, { f10: { minLength: 5, default: 'xx' } }),
        { virtualization: VIRTUALIZATION, validator: true },
      );
      expect(form.deferred('/f10')).toBe(true);
      const errors = await form.validate();
      expect(errors.some((error) => error.dataPath === '/f10')).toBe(true);
    });

    it('renders neither placeholder nor field for a computed-invisible node, and gates it once visible', async () => {
      const form = await renderForm(
        flatSchema(20, {
          f15: { computed: { visible: '../f00 === "show"' } },
        }),
        { virtualization: VIRTUALIZATION },
      );
      expect(form.exists('/f15')).toBe(false);
      expect(form.deferred('/f15')).toBe(false);
      await form.type('/f00', 'show');
      expect(form.exists('/f15')).toBe(false);
      expect(form.deferred('/f15')).toBe(true);
      await intersect(form, '/f15');
      expect(form.exists('/f15')).toBe(true);
    });
  });

  describe('structural changes', () => {
    it('oneOf switch drops the old branch placeholders and gates the new branch', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['game', 'movie'],
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
        ],
      } satisfies JsonSchema;
      const form = await renderForm(schema, {
        virtualization: { threshold: 3, eagerCount: 1, backfill: 'none' },
      });
      expect(form.exists('/category')).toBe(true);
      expect(form.deferred('/platform')).toBe(true);
      await form.selectOption('/category', 'movie');
      expect(form.deferred('/platform')).toBe(false);
      expect(form.exists('/platform')).toBe(false);
      expect(form.deferred('/director')).toBe(true);
      await intersect(form, '/director');
      expect(form.exists('/director')).toBe(true);
    });

    it('items pushed beyond the threshold are deferred', async () => {
      const form = await renderForm(arraySchema, {
        virtualization: VIRTUALIZATION,
        defaultValue: { items: items(12) },
      });
      expect(form.exists('/items/0')).toBe(true);
      expect(form.deferred('/items/11')).toBe(true);
      await form.addItem('/items');
      expect(form.deferred('/items/12')).toBe(true);
      expect(form.exists('/items/12')).toBe(false);
    });

    it('keeps a revealed item eager across sibling removal (reveal ledger)', async () => {
      const form = await renderForm(arraySchema, {
        virtualization: VIRTUALIZATION,
        defaultValue: { items: items(12) },
      });
      await intersect(form, '/items/11');
      expect(form.value('/items/11')).toBe('v11');
      await form.removeItem('/items', 0);
      expect(form.deferred('/items/10')).toBe(false);
      expect(form.exists('/items/10')).toBe(true);
      expect(form.value('/items/10')).toBe('v11');
      expect(form.deferred('/items/5')).toBe(true);
      expect(form.caughtErrors()).toEqual([]);
    });

    it('revealed fields mount exactly once and are not remounted by sibling reveals', async () => {
      const form = await renderForm(flatSchema(20), {
        virtualization: VIRTUALIZATION,
        instrument: true,
      });
      expect(form.mountOrdinal('/f00')).toBe(1);
      await intersect(form, '/f05');
      expect(form.mountOrdinal('/f05')).toBe(1);
      await intersect(form, '/f06');
      expect(form.mountOrdinal('/f05')).toBe(1);
      expect(form.mountOrdinal('/f06')).toBe(1);
      expect(form.mountOrdinal('/f00')).toBe(1);
    });
  });
});
