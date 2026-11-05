// Loaded only by vite.config.ts's production project; this exercises the built public surface.
import { createElement, createRef } from 'react';

import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  VirtualizationBackfill,
  registerPlugin,
} from '../../../dist/index.mjs';
import { createRenderValidator } from '../helpers/createRenderValidator';

/** Production requests open gates without viewport or idle assistance. */
class SilentObserver {
  /** No intersection deliveries are scheduled. */
  observe() {}
  /** No observed targets are retained. */
  unobserve() {}
  /** No work remains at disposal. */
  disconnect() {}
}
/** Exact target below three gated branches. */
const target = '/outer/middle/inner/target';
/** The invalid leaf and unrelated sibling exercise the production public API. */
const schema: JSONSchema = {
  type: 'object',
  properties: {
    first: { type: 'string', default: 'safe' },
    outer: {
      type: 'object',
      properties: {
        first: { type: 'string' },
        middle: {
          type: 'object',
          properties: {
            first: { type: 'string' },
            inner: {
              type: 'object',
              properties: {
                target: { type: 'string', minLength: 3, default: 'x' },
              },
            },
          },
        },
      },
    },
    sibling: { type: 'string' },
  },
};
/** Every test mounts a fresh connected public form. */
let container: HTMLDivElement;
/** React production has no act; DOM readiness is observed with waitFor. */
let root: Root;
/** Public handle attached by the committed form. */
let handle: ReturnType<typeof createRef<FormHandle>>;
beforeEach(async () => {
  expect(process.env.NODE_ENV).toBe('production');
  vi.stubGlobal('IntersectionObserver', SilentObserver);
  registerPlugin({ validator: createRenderValidator() });
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  handle = createRef<FormHandle>();
  root.render(
    createElement(Form, {
      ref: handle,
      jsonSchema: schema,
      virtualization: {
        threshold: 2,
        eagerCount: 1,
        backfill: VirtualizationBackfill.None,
      },
    }),
  );
  await vi.waitFor(() =>
    expect(
      container.querySelector('[data-deferred][data-path="/outer"]'),
    ).not.toBeNull(),
  );
});
afterEach(() => {
  root.unmount();
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// filid:contract exact-focus
it('focuses the nested target and preserves the unrelated placeholder', async () => {
  handle.current!.focus(target);
  await vi.waitFor(() => expect(document.activeElement?.id).toBe(target));
  expect(
    container.querySelector('[data-deferred][data-path="/sibling"]'),
  ).not.toBeNull();
});
it('focuses the exact invalid field after native submission', async () => {
  container
    .querySelector('form')!
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await vi.waitFor(() => expect(document.activeElement?.id).toBe(target));
});
it('lets a newer request replace a pending reveal', async () => {
  const focus = vi.spyOn(HTMLElement.prototype, 'focus');
  handle.current!.focus(target);
  handle.current!.focus('/sibling');
  await vi.waitFor(() =>
    expect(container.querySelector(`input[id="${target}"]`)).not.toBeNull(),
  );
  expect(document.activeElement?.id).toBe('/sibling');
  const older = container.querySelector(`input[id="${target}"]`);
  expect(
    focus.mock.contexts.filter((element) => element === older),
  ).toHaveLength(0);
});
it('calls the target input focus exactly once', async () => {
  const focus = vi.spyOn(HTMLElement.prototype, 'focus');
  handle.current!.focus(target);
  await vi.waitFor(() => expect(document.activeElement?.id).toBe(target));
  const input = container.querySelector(`input[id="${target}"]`);
  expect(
    focus.mock.contexts.filter((element) => element === input),
  ).toHaveLength(1);
});
