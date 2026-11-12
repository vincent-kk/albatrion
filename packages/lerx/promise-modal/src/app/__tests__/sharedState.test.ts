import { afterEach, expect, it, vi } from 'vitest';

import { nodeFactory } from '@/promise-modal/core';

/** The registry belongs to this test environment and is restored after each case. */
const key = Symbol.for('@lerx/promise-modal');
/** Existing module state remains available to any statically imported consumers. */
const original = Reflect.get(globalThis, key);
/** Every evaluated copy is reset before replacing its registry slot. */
const managers: (typeof import('../ModalManager').ModalManager)[] = [];

/** Evaluates an independent manager module against the same JavaScript realm. */
async function loadManager() {
  vi.resetModules();
  const { ModalManager } = await import('../ModalManager');
  managers.push(ModalManager);
  return ModalManager;
}

afterEach(() => {
  for (const manager of managers.splice(0)) manager.reset();
  if (original === undefined) Reflect.deleteProperty(globalThis, key);
  else Reflect.set(globalThis, key, original);
  vi.restoreAllMocks();
});

it('shares ids, publications and style identity across module evaluations', async () => {
  const first = await loadManager();
  first.reset();
  const second = await loadManager();
  const listener = vi.fn();
  second.subscribe(listener);
  const node = nodeFactory({
    type: 'alert',
    id: first.nextId(),
    initiator: '/',
  });
  first.register(node);
  expect(second.node(node.id)).toBe(node);
  expect(second.nextId()).toBe(node.id + 1);
  expect(second.getHashedClassNames('frame')).toBe(
    first.getHashedClassNames('frame'),
  );
  node.onDestroy();
  expect(second.ids).toEqual([]);
  expect(listener).toHaveBeenCalledTimes(3);
});

it("delivers another copy's pre-mount queue through the active handler", async () => {
  const first = await loadManager();
  first.reset();
  const modal = { type: 'alert' as const, title: 'queued across copies' };
  first.open(modal);
  const second = await loadManager();
  const handler = vi.fn((data) =>
    nodeFactory({ ...data, id: second.nextId(), initiator: '/' }),
  );
  second.anchor();
  second.openHandler = handler;
  expect(handler).toHaveBeenCalledWith(modal);
  expect(first.prerender).toEqual([]);
});

it('shares ownership and releases keyboard, inert, scroll and focus resources from either copy', async () => {
  const first = await loadManager();
  first.reset();
  const second = await loadManager();
  const opener = document.createElement('button');
  document.body.append(opener);
  opener.focus();
  const added = vi.spyOn(document, 'addEventListener');
  const removed = vi.spyOn(document, 'removeEventListener');
  const identity = {};
  first.attach(identity, document.body, vi.fn());
  const keyboard = added.mock.calls.find(([type]) => type === 'keydown')?.[1];
  expect(keyboard).toBeTypeOf('function');
  const node = nodeFactory({
    type: 'alert',
    id: first.nextId(),
    initiator: '/',
    dimmed: true,
    lockScroll: true,
  });
  first.register(node);
  const frame = document.createElement('div');
  frame.tabIndex = -1;
  first.anchor().append(frame);
  first.setFrameElement(node.id, frame);
  expect(document.activeElement).toBe(frame);
  expect(opener.hasAttribute('inert')).toBe(true);
  second.detach(identity);
  await Promise.resolve();
  expect(first.anchored).toBe(false);
  expect(removed).toHaveBeenCalledWith('keydown', keyboard);
  expect(opener.hasAttribute('inert')).toBe(false);
  expect(document.body.style.overflow).not.toBe('hidden');
  expect(document.activeElement).toBe(opener);
  expect(node.alive).toBe(false);
  opener.remove();
});

it("invalidates a previous copy's deferred cancellation when another copy attaches", async () => {
  const first = await loadManager();
  first.reset();
  const second = await loadManager();
  const owner = {};
  first.attach(owner, document.body, vi.fn());
  const node = nodeFactory({
    type: 'alert',
    id: first.nextId(),
    initiator: '/',
  });
  first.register(node);
  first.detach(owner);
  second.attach({}, document.body, vi.fn());
  await Promise.resolve();
  expect(node.alive).toBe(true);
  expect(second.node(node.id)).toBe(node);
});

it('isolates incompatible state versions without replacing the existing registry', async () => {
  const incompatible = { version: -1 };
  Reflect.set(globalThis, key, incompatible);
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const first = await loadManager();
  first.open({ type: 'alert', title: 'private queue' });
  const second = await loadManager();
  expect(first.prerender).toHaveLength(1);
  expect(second.prerender).toEqual([]);
  expect(Reflect.get(globalThis, key)).toBe(incompatible);
  if (process.env.NODE_ENV !== 'production')
    expect(warning).toHaveBeenCalledWith(
      expect.stringMatching(/incompatible.*version/i),
    );
  else expect(warning).not.toHaveBeenCalled();
});
