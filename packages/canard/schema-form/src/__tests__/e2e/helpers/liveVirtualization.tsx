import { type ReactElement, StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type FormProps,
  type JSONSchema,
  ValidationMode,
  VirtualizationBackfill,
} from '@/schema-form';

/** Controlled observer keeps disconnected callbacks available for stale-delivery tests. */
export class LiveObserver {
  static instances: LiveObserver[] = [];
  readonly observed = new Set<Element>();
  observe = vi.fn((element: Element) => this.observed.add(element));
  unobserve = vi.fn((element: Element) => this.observed.delete(element));
  disconnect = vi.fn(() => this.observed.clear());
  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options: IntersectionObserverInit,
  ) {
    LiveObserver.instances.push(this);
  }
  reveal(element: Element) {
    this.callback(
      [{ target: element, isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

/** Manual idle queue proves cancellation without relying on browser timing. */
export const idleCallbacks = new Map<number, IdleRequestCallback>();
/** Shared options keep the observer idle until a test explicitly reveals a field. */
export const liveOptions = {
  threshold: 2,
  eagerCount: 1,
  backfill: VirtualizationBackfill.None,
} as const;
/** Array changes exercise the production ChildFields cache and input bridge. */
export const liveSchema: JSONSchema = {
  type: 'array',
  items: { type: 'string' },
};

beforeEach(() => {
  LiveObserver.instances = [];
  idleCallbacks.clear();
  let next = 0;
  vi.stubGlobal('IntersectionObserver', LiveObserver);
  vi.stubGlobal('requestIdleCallback', (callback: IdleRequestCallback) => {
    idleCallbacks.set(++next, callback);
    return next;
  });
  vi.stubGlobal('cancelIdleCallback', (id: number) => idleCallbacks.delete(id));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Mount/rerender the same public Form; strict toggles only the outer test harness. */
export const mountVirtualization = (
  strict: boolean,
  virtualization: FormProps['virtualization'] = liveOptions,
) => {
  const ref = createRef<FormHandle>();
  const defaults = ['first', 'second', 'third', 'fourth'];
  const wrap = (element: ReactElement) =>
    strict ? <StrictMode>{element}</StrictMode> : element;
  const element = (options: FormProps['virtualization']) =>
    wrap(
      <Form
        ref={ref}
        jsonSchema={liveSchema}
        defaultValue={defaults}
        virtualization={options}
        validationMode={ValidationMode.None}
      />,
    );
  const view = render(element(virtualization));
  return {
    ...view,
    ref,
    options: (options: FormProps['virtualization']) =>
      view.rerender(element(options)),
    deferred: () => [
      ...view.container.querySelectorAll<HTMLElement>('[data-deferred]'),
    ],
    inputs: () => [
      ...view.container.querySelectorAll<HTMLInputElement>('input'),
    ],
    append: (value: string) =>
      act(() => {
        const node = ref.current!.node!;
        if (node.type !== 'array') throw new Error('Expected array');
        node.push(value);
      }),
  };
};
