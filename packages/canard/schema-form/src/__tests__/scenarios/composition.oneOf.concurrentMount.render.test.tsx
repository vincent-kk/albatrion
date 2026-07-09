import React, { Suspense, lazy, startTransition, useState } from 'react';

import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { Form } from '@/schema-form';
import { nodeFromJsonSchema } from '@/schema-form/core';

/**
 * Concurrent-mount priming of a default-selected oneOf branch.
 *
 * Node events (EventCascade) are microtask-batched, while every React-side
 * subscription (`useSchemaNodeTracker`, `useSchemaNodeSubscribe`) attaches in
 * `useLayoutEffect` — i.e. at commit. A synchronous mount keeps render, commit
 * and the layout effects in one task, so the cascade drains AFTER the
 * subscriptions exist and the first paint converges.
 *
 * A CONCURRENT mount breaks that ordering: a `React.lazy` retry (Suspense) or
 * a transition render yields to the event loop between the render phase and
 * the commit phase (Suspense even throttles the fallback→content commit by
 * ~300ms). The cascade drains inside that window, the branch-enable /
 * UpdateChildren batches reach zero listeners, and the committed DOM keeps the
 * render-time snapshot: the whole oneOf area is missing until the next node
 * event, while the node tree (and the form VALUE) already contain the branch.
 * This is the docs-site "fast navigation while loading" bug.
 *
 * Generalized fix: the delivery ledger. Every node counts deliveries per
 * event-type bit (`node.revision(mask)`), and `useSchemaNodeTracker` reads
 * that through `useSyncExternalStore`. React re-checks the snapshot at commit,
 * so a revision that advanced in the render→commit gap forces a resync render
 * instead of being lost. `useChildNodeComponents` reads `node.children` during
 * render (no useState mirror) gated by that tracker; `SchemaNodeProxy` reads
 * `node.enabled` the same way. The `useSchemaNodeSubscribe({ onSubscribe })`
 * catch-up covers listener-style consumers (e.g. `useChildNodeErrors`).
 *
 * These tests use the real scheduler (no act) because the bug lives in the
 * exact interleaving of scheduler yields, microtasks and commits.
 */
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = false;

const schema = {
  type: 'object',
  properties: {
    employmentType: {
      type: 'string',
      enum: ['full_time', 'part_time'],
      default: 'full_time',
    },
  },
  oneOf: [
    {
      properties: {
        employmentType: { const: 'full_time' },
        salary: { type: 'number', default: 60000 },
        probation: { type: 'number', default: 3 },
      },
    },
    {
      properties: {
        employmentType: { const: 'part_time' },
        weeklyHours: { type: 'number', default: 20 },
      },
    },
  ],
} satisfies JsonSchema;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Polls with real timers; Suspense throttles retry commits by ~300ms. */
const until = async (predicate: () => boolean, timeoutMs = 3000) => {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > timeoutMs) return false;
    await wait(20);
  }
  return true;
};

const containers: HTMLElement[] = [];
const roots: Array<{ unmount: () => void }> = [];
afterEach(async () => {
  for (const root of roots.splice(0)) root.unmount();
  for (const el of containers.splice(0)) el.remove();
  await wait(20);
});

const mount = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  containers.push(container);
  const root = createRoot(container);
  roots.push(root);
  return { container, root };
};

const has = (container: HTMLElement, path: string) =>
  container.querySelector(`[data-path="${path}"]`) !== null;

/** Burns CPU during render so the concurrent work loop yields mid-render. */
const Slow = ({ ms }: { ms: number }) => {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    /* busy */
  }
  return null;
};

/**
 * Warms module/schema caches with a plain direct mount so the lazy retry
 * render below is FAST. A slow (cold) retry render can outlive the ~300ms
 * Suspense commit throttle, which re-attaches the commit to the render task
 * and hides the bug; the fast warm render commits detached and pins it
 * deterministically.
 */
const warmUp = async () => {
  const { container, root } = mount();
  root.render(<Form jsonSchema={schema} />);
  await until(() => has(container, '/salary'));
  root.unmount();
};

describe('composition.oneOf — concurrent mount (lazy retry / transition)', () => {
  it('renders the default-selected branch after a React.lazy retry mount', async () => {
    await warmUp();
    const { container, root } = mount();
    let resolveModule!: (m: { default: React.ComponentType }) => void;
    const LazyDemo = lazy(
      () =>
        new Promise<{ default: React.ComponentType }>((r) => {
          resolveModule = r;
        }),
    );
    root.render(
      <Suspense fallback={<div data-probe="fallback" />}>
        <LazyDemo />
      </Suspense>,
    );
    await until(() => container.querySelector('[data-probe]') !== null);

    // The chunk arrives while the route is already suspended — the retry
    // render is concurrent and commits detached from the event cascade.
    resolveModule({ default: () => <Form jsonSchema={schema} /> });
    await until(() => has(container, '/employmentType'));

    const branchAppeared = await until(() => has(container, '/salary'));
    expect(branchAppeared).toBe(true);
    expect(has(container, '/probation')).toBe(true);
    expect(has(container, '/weeklyHours')).toBe(false);
  });

  it('renders the default-selected branch after a transition mount with a yielding render', async () => {
    const { container, root } = mount();
    let show!: (visible: boolean) => void;
    const App = () => {
      const [visible, setVisible] = useState(false);
      show = setVisible;
      return visible ? (
        <>
          <Form jsonSchema={schema} />
          <Slow ms={3} />
          <Slow ms={3} />
          <Slow ms={3} />
        </>
      ) : null;
    };
    root.render(<App />);
    await wait(50);

    startTransition(() => show(true));
    await until(() => has(container, '/employmentType'));

    const branchAppeared = await until(() => has(container, '/salary'));
    expect(branchAppeared).toBe(true);
    expect(has(container, '/weeklyHours')).toBe(false);
  });

  it('keeps branch switching reactive after a lazy retry mount', async () => {
    const { container, root } = mount();
    let resolveModule!: (m: { default: React.ComponentType }) => void;
    const LazyDemo = lazy(
      () =>
        new Promise<{ default: React.ComponentType }>((r) => {
          resolveModule = r;
        }),
    );
    root.render(
      <Suspense fallback={null}>
        <LazyDemo />
      </Suspense>,
    );
    await wait(20);
    resolveModule({ default: () => <Form jsonSchema={schema} /> });
    await until(() => has(container, '/salary'));

    const select = container.querySelector(
      '[id="/employmentType"]',
    ) as HTMLSelectElement | null;
    expect(select).not.toBeNull();

    select!.value = 'part_time';
    select!.dispatchEvent(new Event('change', { bubbles: true }));
    const switched = await until(
      () => has(container, '/weeklyHours') && !has(container, '/salary'),
    );
    expect(switched).toBe(true);

    select!.value = 'full_time';
    select!.dispatchEvent(new Event('change', { bubbles: true }));
    const restored = await until(
      () => has(container, '/salary') && !has(container, '/weeklyHours'),
    );
    expect(restored).toBe(true);
  });
});

/**
 * Precondition for the render fix: `useChildNodeComponents` reads
 * `node.children` during render and memoizes on that reference, so a stable
 * reference is what keeps unrelated re-renders from recomputing the child
 * component list. This locks that node-tree invariant so a future core
 * refactor cannot silently reintroduce per-render churn.
 */
describe('composition.oneOf — node.children reference stability (memo precondition)', () => {
  it('is idempotent, stable across non-structural change, fresh only on structural change', async () => {
    const root = nodeFromJsonSchema({
      jsonSchema: schema,
      onChange: () => {},
    });
    await wait(50);

    const c1 = root.children;
    // Idempotent read: same reference within one settled state.
    expect(root.children).toBe(c1);

    // Non-structural mutation (leaf value on the active branch): the active
    // child set is unchanged, so the reference must be preserved → useMemo
    // bails out and does NOT rebuild the component list.
    root.find('/salary')?.setValue(70000 as any);
    await wait(50);
    expect(root.children).toBe(c1);

    // Structural mutation (oneOf branch switch): the active child set changes,
    // so a fresh reference is expected → useMemo correctly recomputes.
    root.setValue({ employmentType: 'part_time' });
    await wait(50);
    const c2 = root.children;
    expect(c2).not.toBe(c1);
    // ...and stable again once settled.
    expect(root.children).toBe(c2);
  });
});
