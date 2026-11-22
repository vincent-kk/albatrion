import { plugin } from '@canard/schema-form-ajv8-plugin';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, VirtualizationBackfill } from '@/schema-form';

/** IntersectionObserver stand-in that never intersects and records live observed targets. */
const live = new Set<Element>();
const observers = new Set<StubObserver>();
class StubObserver {
  targets = new Set<Element>();
  constructor(public callback: IntersectionObserverCallback) {
    observers.add(this);
  }
  observe(target: Element) {
    this.targets.add(target);
    live.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
    live.delete(target);
  }
  disconnect() {
    for (const target of this.targets) live.delete(target);
    this.targets.clear();
  }
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  live.clear();
  observers.clear();
  vi.stubGlobal('IntersectionObserver', StubObserver);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const schema = {
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: 12 }, (_, index) => [
      `field_${index}`,
      { type: 'string', minLength: 2 },
    ]),
  ),
} as const;

/** LC4: an unmounted Form leaves no document/window listener and no observed element behind. */
it('unmounting a virtualized Form with a pending focus request releases document listeners and observation', async () => {
  const added: Array<[EventTarget, string, unknown]> = [];
  const removed: Array<[EventTarget, string, unknown]> = [];
  for (const target of [document, window] as EventTarget[]) {
    const add = target.addEventListener.bind(target);
    const remove = target.removeEventListener.bind(target);
    vi.spyOn(target, 'addEventListener').mockImplementation((type, listener, options) => {
      added.push([target, type, listener]);
      return add(type, listener, options);
    });
    vi.spyOn(target, 'removeEventListener').mockImplementation((type, listener, options) => {
      removed.push([target, type, listener]);
      return remove(type, listener, options);
    });
  }
  const ref = createRef<FormHandle<typeof schema>>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      validatorFactory={plugin.validator}
      virtualization={{ threshold: 4, eagerCount: 2, backfill: VirtualizationBackfill.None }}
    />,
  );
  expect(view.container.querySelectorAll('[data-deferred]').length).toBeGreaterThan(0);
  const first = view.container.querySelector<HTMLInputElement>('input')!;
  first.focus();
  act(() => {
    fireEvent.change(first, { target: { value: 'a' } });
  });
  act(() => {
    ref.current?.focus('/field_11');
  });
  view.unmount();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
  });
  /** React DOM installs these once per document for its own event system. */
  const reactDomOwned = new Set(['selectionchange', 'mouseover', 'mouseout']);
  const leaked = added.filter(
    ([target, type, listener]) =>
      !reactDomOwned.has(type) &&
      !removed.some(([t, ty, l]) => t === target && ty === type && l === listener),
  );
  expect({
    leakedListeners: leaked.map(([target, type]) => `${target === document ? 'document' : 'window'}:${type}`),
    observed: live.size,
  }).toEqual({ leakedListeners: [], observed: 0 });
});
