import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * StrictMode variants of the deferred-mount (virtualization) suite.
 *
 * StrictMode simulates unmount/remount: ref callbacks detach/re-attach and the
 * VirtualizationContext provider's effect cleanup runs `manager.disconnect()`
 * mid-life. The manager contract under test is that disconnect is resumable —
 * re-registration from the re-attached placeholder refs must self-heal the
 * observation set and restart the idle pump, with no double-reveals and no
 * window errors.
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

const flushIdle = async () => {
  await act(async () => {
    const batch = idleQueue.splice(0);
    for (const callback of batch)
      callback({ didTimeout: false, timeRemaining: () => 50 });
  });
};

const flatSchema = (count: number): JsonSchema => ({
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: count }, (_, index) => [
      `f${String(index).padStart(2, '0')}`,
      { type: 'string', default: `v${index}` },
    ]),
  ),
});

describe('deferred-mount under StrictMode', () => {
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

  it('gates fields and keeps placeholders registered across the simulated remount', async () => {
    const form = await renderForm(flatSchema(20), {
      strictMode: true,
      virtualization: { threshold: 10, eagerCount: 3, backfill: 'none' },
    });
    expect(form.exists('/f02')).toBe(true);
    expect(form.deferredPaths()).toHaveLength(17);
    const observer = MockIntersectionObserver.instances[0];
    const placeholder = form.container.querySelector(
      '[data-path="/f05"][data-deferred]',
    );
    expect(placeholder && observer.observed.has(placeholder)).toBe(true);
    await act(async () => {
      observer.intersect(placeholder as Element);
    });
    expect(form.exists('/f05')).toBe(true);
    expect(form.deferred('/f05')).toBe(false);
    expect(form.caughtErrors()).toEqual([]);
  });

  it('idle backfill drains every placeholder after the disconnect/resume cycle', async () => {
    const form = await renderForm(flatSchema(20), {
      strictMode: true,
      virtualization: { threshold: 10, eagerCount: 3, backfill: 'idle' },
    });
    while (form.deferredPaths().length > 0 && idleQueue.length > 0)
      await flushIdle();
    expect(form.deferredPaths()).toHaveLength(0);
    expect(form.exists('/f19')).toBe(true);
    expect(form.value('/f19')).toBe('v19');
    expect(form.caughtErrors()).toEqual([]);
  });

  it('handle.focus(path) force-reveals and focuses under StrictMode (single replay)', async () => {
    const form = await renderForm(flatSchema(20), {
      strictMode: true,
      virtualization: { threshold: 10, eagerCount: 3, backfill: 'none' },
    });
    await act(async () => {
      form.handle.focus('/f15');
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(form.exists('/f15')).toBe(true);
    expect(document.activeElement).toBe(form.field('/f15'));
    expect(form.caughtErrors()).toEqual([]);
  });
});
