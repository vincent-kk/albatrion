import { describe, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { FieldLifecycle } from '../../constants/FieldLifecycle';
import { FieldLifecycleAction } from '../../constants/FieldLifecycleAction';
import { FieldLifecycleRegistry } from '../FieldLifecycleRegistry';

/** Independent field identity for queue isolation. */
const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });

// filid:contract lifecycle-queue
describe('FieldLifecycleRegistry', () => {
  it('detaches a FIFO queue, freezes one shared event and combines actions once', () => {
    const registry = new FieldLifecycleRegistry(vi.fn());
    const calls: unknown[] = [];
    registry.reserve(node, FieldLifecycle.Mount, (event) => {
      calls.push(event);
      return FieldLifecycleAction.Focus;
    });
    registry.reserve(node, FieldLifecycle.Mount, (event) => {
      calls.push(event);
      return FieldLifecycleAction.Select;
    });
    expect(registry.fire(node, FieldLifecycle.Mount)).toBe(
      FieldLifecycleAction.Focus | FieldLifecycleAction.Select,
    );
    expect(calls).toHaveLength(2);
    expect(calls[0]).toBe(calls[1]);
    expect(calls[0]).toEqual({ node, type: FieldLifecycle.Mount });
    expect(Object.isFrozen(calls[0])).toBe(true);
    expect(registry.fire(node, FieldLifecycle.Mount)).toBe(
      FieldLifecycleAction.None,
    );
    expect(registry.pending).toBe(0);
  });
  it('leaves reservations made during fire for the next event', () => {
    const registry = new FieldLifecycleRegistry(vi.fn());
    const next = vi.fn(() => FieldLifecycleAction.Select);
    registry.reserve(node, FieldLifecycle.Render, () => {
      registry.reserve(node, FieldLifecycle.Render, next);
      return FieldLifecycleAction.Focus;
    });
    expect(registry.fire(node, FieldLifecycle.Render)).toBe(
      FieldLifecycleAction.Focus,
    );
    expect(next).not.toHaveBeenCalled();
    expect(registry.pending).toBe(FieldLifecycle.Render);
    expect(registry.fire(node, FieldLifecycle.Render)).toBe(
      FieldLifecycleAction.Select,
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
  it('cancels before fire idempotently and clears the final pending bit', () => {
    const registry = new FieldLifecycleRegistry(vi.fn());
    const handler = vi.fn(() => FieldLifecycleAction.Focus);
    const cancel = registry.reserve(node, FieldLifecycle.Mount, handler);
    cancel();
    cancel();
    expect(registry.pending).toBe(0);
    expect(registry.has(node, FieldLifecycle.Mount)).toBe(false);
    registry.fire(node, FieldLifecycle.Mount);
    expect(handler).not.toHaveBeenCalled();
  });
  it('skips a cancelled detached entry without deleting a new queue', () => {
    const registry = new FieldLifecycleRegistry(vi.fn());
    const skipped = vi.fn(() => FieldLifecycleAction.Select);
    const next = vi.fn(() => FieldLifecycleAction.Select);
    let cancel = () => {};
    registry.reserve(node, FieldLifecycle.Mount, () => {
      registry.reserve(node, FieldLifecycle.Mount, next);
      cancel();
      return FieldLifecycleAction.Focus;
    });
    cancel = registry.reserve(node, FieldLifecycle.Mount, skipped);
    expect(registry.fire(node, FieldLifecycle.Mount)).toBe(
      FieldLifecycleAction.Focus,
    );
    expect(skipped).not.toHaveBeenCalled();
    expect(registry.has(node, FieldLifecycle.Mount)).toBe(true);
    registry.fire(node, FieldLifecycle.Mount);
    expect(next).toHaveBeenCalledTimes(1);
  });
  it('ignores cancellation after execution without touching a replacement queue', () => {
    const registry = new FieldLifecycleRegistry(vi.fn());
    const cancel = registry.reserve(
      node,
      FieldLifecycle.Mount,
      () => FieldLifecycleAction.Focus,
    );
    registry.fire(node, FieldLifecycle.Mount);
    registry.reserve(
      node,
      FieldLifecycle.Mount,
      () => FieldLifecycleAction.Select,
    );
    cancel();
    expect(registry.fire(node, FieldLifecycle.Mount)).toBe(
      FieldLifecycleAction.Select,
    );
  });
  it('keeps lifecycle and node queues independent and pending until the last queue is empty', () => {
    const other = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
    const registry = new FieldLifecycleRegistry(vi.fn());
    registry.reserve(
      node,
      FieldLifecycle.Mount,
      () => FieldLifecycleAction.Focus,
    );
    registry.reserve(
      other,
      FieldLifecycle.Mount,
      () => FieldLifecycleAction.Select,
    );
    registry.reserve(
      node,
      FieldLifecycle.Unmount,
      () => FieldLifecycleAction.None,
    );
    expect(registry.pending).toBe(
      FieldLifecycle.Mount | FieldLifecycle.Unmount,
    );
    registry.fire(node, FieldLifecycle.Mount);
    expect(registry.has(node, FieldLifecycle.Mount)).toBe(false);
    expect(registry.has(other, FieldLifecycle.Mount)).toBe(true);
    expect(registry.pending).toBe(
      FieldLifecycle.Mount | FieldLifecycle.Unmount,
    );
    registry.fire(other, FieldLifecycle.Mount);
    expect(registry.pending).toBe(FieldLifecycle.Unmount);
    registry.fire(node, FieldLifecycle.Unmount);
    expect(registry.pending).toBe(0);
  });
  it('reports a handler failure and continues in reservation order', () => {
    const report = vi.fn();
    const registry = new FieldLifecycleRegistry(report);
    const error = new Error('handler');
    const order: number[] = [];
    registry.reserve(node, FieldLifecycle.Mount, () => {
      order.push(1);
      throw error;
    });
    registry.reserve(node, FieldLifecycle.Mount, () => {
      order.push(2);
      return FieldLifecycleAction.Focus;
    });
    expect(registry.fire(node, FieldLifecycle.Mount)).toBe(
      FieldLifecycleAction.Focus,
    );
    expect(order).toEqual([1, 2]);
    expect(report).toHaveBeenCalledExactlyOnceWith(error, node);
  });
});
