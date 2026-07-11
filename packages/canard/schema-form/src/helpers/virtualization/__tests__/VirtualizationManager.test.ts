import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SchemaNode } from '@/schema-form/core';
import type { ResolvedVirtualizationOptions } from '@/schema-form/helpers/virtualization';
import {
  VirtualizationBackfill,
  VirtualizationManager,
} from '@/schema-form/helpers/virtualization';

import type { IdleDeadlineLike } from '../VirtualizationManager/scheduleIdle';

class MockIntersectionObserver {
  public static instances: MockIntersectionObserver[] = [];
  public readonly observed = new Set<Element>();
  public disconnected = false;
  constructor(
    public readonly callback: IntersectionObserverCallback,
    public readonly options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this);
  }
  observe(element: Element) {
    this.observed.add(element);
    this.disconnected = false;
  }
  unobserve(element: Element) {
    this.observed.delete(element);
  }
  disconnect() {
    this.observed.clear();
    this.disconnected = true;
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

type IdleCallback = (deadline: IdleDeadlineLike) => void;

const idleQueue: Array<{ id: number; callback: IdleCallback }> = [];
let idleSequence = 0;

const stubIdleCallback = () => {
  vi.stubGlobal('requestIdleCallback', (callback: IdleCallback) => {
    idleQueue.push({ id: ++idleSequence, callback });
    return idleSequence;
  });
  vi.stubGlobal('cancelIdleCallback', (id: number) => {
    const index = idleQueue.findIndex((entry) => entry.id === id);
    if (index >= 0) idleQueue.splice(index, 1);
  });
};

const flushIdle = (deadline?: Partial<IdleDeadlineLike>) => {
  const batch = idleQueue.splice(0);
  for (const entry of batch)
    entry.callback({
      didTimeout: false,
      timeRemaining: () => 50,
      ...deadline,
    });
};

const OPTIONS: ResolvedVirtualizationOptions = {
  threshold: 30,
  eagerCount: 20,
  rootMargin: '100%',
  backfill: VirtualizationBackfill.Idle,
  estimateHeight: 40,
  Placeholder: null,
};

const createManager = (options?: Partial<ResolvedVirtualizationOptions>) =>
  new VirtualizationManager({ ...OPTIONS, ...options });

const createElements = (count: number) =>
  Array.from({ length: count }, () => document.createElement('div'));

describe('VirtualizationManager', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    idleQueue.length = 0;
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    stubIdleCallback();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates one shared observer with the configured rootMargin and observes registered elements', () => {
    const manager = createManager({ rootMargin: '50%' });
    const [first, second] = createElements(2);
    manager.register(first, vi.fn());
    manager.register(second, vi.fn());
    expect(MockIntersectionObserver.instances).toHaveLength(1);
    const observer = MockIntersectionObserver.instances[0];
    expect(observer.options?.rootMargin).toBe('50%');
    expect(observer.observed.has(first)).toBe(true);
    expect(observer.observed.has(second)).toBe(true);
  });

  it('reveals once on intersection, unobserves, and ignores repeated intersections', () => {
    const manager = createManager();
    const [element] = createElements(1);
    const reveal = vi.fn();
    manager.register(element, reveal);
    const observer = MockIntersectionObserver.instances[0];
    observer.intersect(element);
    observer.intersect(element);
    expect(reveal).toHaveBeenCalledTimes(1);
    expect(observer.observed.has(element)).toBe(false);
  });

  it('register replaces the reveal callback for an already registered element', () => {
    const manager = createManager();
    const [element] = createElements(1);
    const stale = vi.fn();
    const fresh = vi.fn();
    manager.register(element, stale);
    manager.register(element, fresh);
    MockIntersectionObserver.instances[0].intersect(element);
    expect(stale).not.toHaveBeenCalled();
    expect(fresh).toHaveBeenCalledTimes(1);
  });

  it('unregister is idempotent and safe for unknown or already revealed elements', () => {
    const manager = createManager();
    const [registered, unknown] = createElements(2);
    manager.register(registered, vi.fn());
    expect(() => {
      manager.unregister(unknown);
      manager.unregister(registered);
      manager.unregister(registered);
    }).not.toThrow();
    expect(MockIntersectionObserver.instances[0].observed.size).toBe(0);
  });

  it('keeps exactly one live registration across a StrictMode register→unregister→register sequence', () => {
    const manager = createManager();
    const [element] = createElements(1);
    const reveal = vi.fn();
    manager.register(element, reveal);
    manager.unregister(element);
    manager.register(element, reveal);
    const observer = MockIntersectionObserver.instances[0];
    expect(observer.observed.has(element)).toBe(true);
    observer.intersect(element);
    expect(reveal).toHaveBeenCalledTimes(1);
  });

  it('hasRevealed reflects markRevealed per node instance', () => {
    const manager = createManager();
    const revealed = {} as unknown as SchemaNode;
    const untouched = {} as unknown as SchemaNode;
    expect(manager.hasRevealed(revealed)).toBe(false);
    manager.markRevealed(revealed);
    manager.markRevealed(revealed);
    expect(manager.hasRevealed(revealed)).toBe(true);
    expect(manager.hasRevealed(untouched)).toBe(false);
  });

  it('idle backfill reveals in registration order in slices of at most 25', () => {
    const manager = createManager();
    const elements = createElements(30);
    const order: number[] = [];
    elements.forEach((element, index) =>
      manager.register(element, () => order.push(index)),
    );
    flushIdle();
    expect(order).toEqual(Array.from({ length: 25 }, (_, index) => index));
    flushIdle();
    expect(order).toHaveLength(30);
    expect(order.slice(25)).toEqual([25, 26, 27, 28, 29]);
  });

  it('idle backfill stops revealing when the deadline budget is exhausted and reschedules', () => {
    const manager = createManager();
    const elements = createElements(10);
    const reveal = vi.fn();
    elements.forEach((element) => manager.register(element, reveal));
    let remaining = 3;
    flushIdle({ timeRemaining: () => (remaining-- > 0 ? 10 : 0) });
    expect(reveal.mock.calls.length).toBeLessThan(10);
    expect(idleQueue.length).toBeGreaterThan(0);
    flushIdle();
    expect(reveal).toHaveBeenCalledTimes(10);
  });

  it('backfill none never schedules idle work', () => {
    const manager = createManager({ backfill: VirtualizationBackfill.None });
    const elements = createElements(5);
    elements.forEach((element) => manager.register(element, vi.fn()));
    expect(idleQueue).toHaveLength(0);
  });

  it('stops the idle pump once the registry drains', () => {
    const manager = createManager();
    const [element] = createElements(1);
    manager.register(element, vi.fn());
    flushIdle();
    expect(idleQueue).toHaveLength(0);
  });

  it('disconnect cancels idle work, disconnects the observer, and clears the registry', () => {
    const manager = createManager();
    const [element] = createElements(1);
    const reveal = vi.fn();
    manager.register(element, reveal);
    const observer = MockIntersectionObserver.instances[0];
    manager.disconnect();
    expect(idleQueue).toHaveLength(0);
    expect(observer.disconnected).toBe(true);
    observer.observe(element);
    observer.intersect(element);
    expect(reveal).not.toHaveBeenCalled();
  });

  it('resumes after disconnect: a later register restarts observation and the idle pump', () => {
    const manager = createManager();
    const [first, second] = createElements(2);
    manager.register(first, vi.fn());
    manager.disconnect();
    const reveal = vi.fn();
    manager.register(second, reveal);
    const observer = MockIntersectionObserver.instances[0];
    expect(observer.observed.has(second)).toBe(true);
    flushIdle();
    expect(reveal).toHaveBeenCalledTimes(1);
  });

  it('falls back to a cancelable safe macrotask when requestIdleCallback is unavailable', async () => {
    vi.stubGlobal('requestIdleCallback', undefined);
    vi.stubGlobal('cancelIdleCallback', undefined);
    const manager = createManager();
    const elements = createElements(3);
    const reveal = vi.fn();
    elements.forEach((element) => manager.register(element, reveal));
    // The Safe scheduler binds the real setImmediate/setTimeout at module
    // load, so wait for an actual macrotask turn instead of faking timers.
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(reveal).toHaveBeenCalledTimes(3);
  });
});
