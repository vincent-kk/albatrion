// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import {
  VirtualizationBackfill,
  resolveVirtualizationOptions,
} from '../../resolveVirtualizationOptions';
import { VirtualizationManager } from '../VirtualizationManager';

/** An enabled manager without asynchronous backfill. */
const createManager = () => {
  const options = resolveVirtualizationOptions({
    backfill: VirtualizationBackfill.None,
  });
  if (!options) throw new Error('enabled options');
  return new VirtualizationManager(options);
};
/** A branch and its descendant require the same outer gate. */
const root = nodeFromJSONSchema({
  jsonSchema: { type: 'object', properties: { target: { type: 'string' } } },
});
/** Descendant focused by each request. */
const target = root.find('/target')!;
afterEach(() => document.body.replaceChildren());

it('records the render path before synchronous reveal and settles once after commit', () => {
  const manager = createManager();
  const element = document.body.appendChild(document.createElement('div'));
  const settled = vi.fn();
  const reveal = vi.fn(() => {
    expect(manager.hasRevealed(target)).toBe(true);
    manager.unregister(element);
    manager.settleReveal(root);
  });
  manager.register(element, { node: root, reveal });
  expect(manager.revealPath(target, settled)).toBe(true);
  expect(reveal).toHaveBeenCalledTimes(1);
  expect(settled).toHaveBeenCalledTimes(1);
  manager.settleReveal(root);
  expect(settled).toHaveBeenCalledTimes(1);
  expect(manager.revealPath(target, vi.fn())).toBe(false);
});
it('reuses an opening gate, preserves it on disconnect and replaces the settled callback', () => {
  const manager = createManager();
  const element = document.body.appendChild(document.createElement('div'));
  const reveal = vi.fn();
  const first = vi.fn();
  const second = vi.fn();
  manager.register(element, { node: root, reveal });
  manager.revealPath(target, first);
  manager.disconnect();
  expect(manager.revealPath(target, second)).toBe(true);
  expect(reveal).toHaveBeenCalledTimes(1);
  manager.settleReveal(target);
  expect(second).not.toHaveBeenCalled();
  manager.settleReveal(root);
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledTimes(1);
});
it('finishes a removed gate only after the microtask confirmation', async () => {
  const manager = createManager();
  const element = document.body.appendChild(document.createElement('div'));
  const settled = vi.fn();
  manager.register(element, { node: root, reveal: vi.fn() });
  manager.revealPath(target, settled);
  manager.unregister(element);
  manager.releaseGate(element);
  expect(settled).not.toHaveBeenCalled();
  await Promise.resolve();
  expect(settled).toHaveBeenCalledTimes(1);
});
it('preserves same-task re-registration and ignores stale release callbacks', async () => {
  const manager = createManager();
  const element = document.body.appendChild(document.createElement('div'));
  const gate = { node: root, reveal: vi.fn() };
  const settled = vi.fn();
  manager.register(element, gate);
  manager.revealPath(target, settled);
  manager.unregister(element);
  manager.releaseGate(element);
  manager.register(element, gate);
  await Promise.resolve();
  expect(settled).not.toHaveBeenCalled();
  manager.unregister(element);
  manager.releaseGate(element);
  const newer = vi.fn();
  manager.register(element, gate);
  manager.revealPath(target, newer);
  await Promise.resolve();
  expect(newer).not.toHaveBeenCalled();
  manager.settleReveal(root);
  expect(newer).toHaveBeenCalledTimes(1);
});
it('records nothing when no blocking gate exists', () => {
  const manager = createManager();
  expect(manager.revealPath(target, vi.fn())).toBe(false);
  expect(manager.hasRevealed(target)).toBe(false);
  expect(manager.hasRevealed(root)).toBe(false);
});
