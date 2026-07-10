import { JSDOM } from 'jsdom';

/**
 * Single shared JSDOM environment for all benchmarks.
 *
 * Sets all DOM globals via `Object.defineProperty` so that newer Node
 * versions (≥26) which expose `navigator` as a getter-only global still
 * accept the assignment.
 */
let cached: JSDOM | null = null;

export function setupJsdom(): JSDOM {
  if (cached !== null) return cached;

  const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable',
  });

  const g = globalThis as any;
  const set = (key: string, value: unknown) => {
    Object.defineProperty(g, key, {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  };

  set('document', dom.window.document);
  set('window', dom.window);
  set('navigator', dom.window.navigator);
  set('Element', dom.window.Element);
  set('HTMLElement', dom.window.HTMLElement);
  set('HTMLInputElement', dom.window.HTMLInputElement);
  set('HTMLFormElement', dom.window.HTMLFormElement);
  set('HTMLSelectElement', dom.window.HTMLSelectElement);
  set('Event', dom.window.Event);
  set('MouseEvent', dom.window.MouseEvent);
  set('KeyboardEvent', dom.window.KeyboardEvent);

  // jsdom has no IntersectionObserver. Provide a never-firing stub so
  // virtualization-enabled adapters keep their placeholders deferred — mount
  // then measures the eager-only cost instead of silently disabling the
  // feature (schema-form falls back to mount-everything when the API is
  // absent). Adapters without virtualization never construct an observer.
  class NoopIntersectionObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): never[] {
      return [];
    }
  }
  set('IntersectionObserver', NoopIntersectionObserver);

  cached = dom;
  return dom;
}

/**
 * Drains `count` macrotask ticks (each flushes pending microtasks too).
 *
 * One tick is enough for React commit + effects + the schema-form
 * `EventCascadeManager` microtask cascade, so the DOM is rendered.
 *
 * ⚠️ The `<Form>` imperative handle (`getValue`/`findNode`) becomes
 * populated only on the SECOND tick — `rootNode` is set in an effect that
 * triggers a re-render, and the handle reads the re-rendered state. Code
 * that touches the ref handle MUST drain ≥2 ticks (use `drainUntilReady`).
 */
export const drainTicks = (count = 1): Promise<void> =>
  new Promise<void>((resolve) => {
    let remaining = Math.max(1, count);
    const tick = () => {
      remaining -= 1;
      if (remaining <= 0) resolve();
      else setTimeout(tick, 0);
    };
    setTimeout(tick, 0);
  });

/**
 * Drain ticks until `predicate()` is truthy (handle ready), up to
 * `maxTicks`. Throws if the predicate never holds — converts a silent
 * "handle not ready → null node → no-op benchmark" into a loud failure.
 */
export async function drainUntilReady(
  predicate: () => boolean,
  maxTicks = 12,
): Promise<void> {
  for (let i = 0; i < maxTicks; i++) {
    await drainTicks(1);
    if (predicate()) return;
  }
  throw new Error(
    `drainUntilReady: predicate never satisfied after ${maxTicks} ticks`,
  );
}

/**
 * Force a major GC if Node was started with `--expose-gc`.
 * No-op otherwise. Use sparingly — calling it inside hot loops biases timing.
 */
export const forceGc = () => {
  const g = globalThis as any;
  if (typeof g.gc === 'function') g.gc();
};
