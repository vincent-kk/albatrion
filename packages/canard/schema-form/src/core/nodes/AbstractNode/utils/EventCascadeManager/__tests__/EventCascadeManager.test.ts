import { describe, expect, it, vi } from 'vitest';

import { BIT_MASK_ALL } from '@/schema-form/app/constants';
import { NodeEventType } from '@/schema-form/core/nodes/type';

import { EventCascadeManager } from '../EventCascadeManager';

/**
 * Delivery-ledger contract of EventCascadeManager.
 *
 * The ledger exists so that subscribers attaching AFTER a delivery (e.g. a
 * React commit detached from its render phase under concurrent rendering)
 * can detect batches they missed: `revision(mask)` must advance on every
 * delivery of a matching type, with or without listeners.
 */

const getInfo = () => ({ path: '/test', dependencies: [] });

/** Drains the microtask queue twice (publish batches resolve via microtask). */
const drain = () =>
  new Promise<void>((resolve) => queueMicrotask(() => queueMicrotask(resolve)));

describe('EventCascadeManager delivery ledger', () => {
  it('advances revision when a published batch is delivered', async () => {
    const manager = new EventCascadeManager(getInfo);
    expect(manager.revision(NodeEventType.UpdateValue)).toBe(0);

    manager.publish(NodeEventType.UpdateValue);
    await drain();

    expect(manager.revision(NodeEventType.UpdateValue)).toBe(1);
  });

  it('advances revision even when no listener is attached', async () => {
    const manager = new EventCascadeManager(getInfo);

    manager.publish(NodeEventType.UpdateChildren);
    await drain();

    // The whole point of the ledger: a late subscriber can still detect
    // the delivery it missed.
    expect(manager.revision(NodeEventType.UpdateChildren)).toBe(1);
  });

  it('merges same-tick publishes into one delivery per type bit', async () => {
    const manager = new EventCascadeManager(getInfo);

    manager.publish(NodeEventType.UpdateValue);
    manager.publish(NodeEventType.UpdateValue);
    manager.publish(NodeEventType.UpdateState);
    await drain();

    expect(manager.revision(NodeEventType.UpdateValue)).toBe(1);
    expect(manager.revision(NodeEventType.UpdateState)).toBe(1);
  });

  it('accumulates across sequential batches', async () => {
    const manager = new EventCascadeManager(getInfo);

    manager.publish(NodeEventType.UpdateValue);
    await drain();
    manager.publish(NodeEventType.UpdateValue);
    await drain();

    expect(manager.revision(NodeEventType.UpdateValue)).toBe(2);
  });

  it('leaves disjoint masks untouched and sums combined masks', async () => {
    const manager = new EventCascadeManager(getInfo);

    manager.publish(NodeEventType.UpdateValue);
    manager.publish(NodeEventType.UpdateChildren);
    await drain();

    expect(manager.revision(NodeEventType.UpdateError)).toBe(0);
    expect(
      manager.revision(
        NodeEventType.UpdateValue | NodeEventType.UpdateChildren,
      ),
    ).toBe(2);
  });

  it('advances synchronously for dispatch()', () => {
    const manager = new EventCascadeManager(getInfo);

    manager.dispatch(NodeEventType.RequestRemount);

    expect(manager.revision(NodeEventType.RequestRemount)).toBe(1);
  });

  it('keeps counting after unsubscribe and after cleanUp', async () => {
    const manager = new EventCascadeManager(getInfo);
    const listener = vi.fn();
    const unsubscribe = manager.subscribe(listener);

    manager.publish(NodeEventType.UpdateValue);
    await drain();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    manager.publish(NodeEventType.UpdateValue);
    await drain();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(manager.revision(NodeEventType.UpdateValue)).toBe(2);

    manager.cleanUp();
    manager.publish(NodeEventType.UpdateValue);
    await drain();
    expect(manager.revision(NodeEventType.UpdateValue)).toBe(3);
  });

  it('supports the late-subscriber catch-up pattern end to end', async () => {
    const manager = new EventCascadeManager(getInfo);

    // Delivery happens before anyone subscribes (render→commit gap).
    manager.publish(NodeEventType.UpdateChildren);
    const seenAtRender = 0; // captured before the delivery drained
    await drain();

    // Commit: subscription attaches, then compares revisions to catch up.
    const listener = vi.fn();
    manager.subscribe(listener);
    expect(listener).not.toHaveBeenCalled();
    expect(manager.revision(NodeEventType.UpdateChildren)).not.toBe(
      seenAtRender,
    );
  });

  // Robustness of the bit-iterating ledger read/write (verified via probe).

  it('sums every bit for the BIT_MASK_ALL default and terminates', async () => {
    const manager = new EventCascadeManager(getInfo);

    manager.publish(NodeEventType.UpdateValue);
    manager.publish(NodeEventType.UpdateChildren);
    await drain();
    manager.dispatch(NodeEventType.RequestRemount);

    // ~0 (all 32 bits set) must loop to completion and sum all slots.
    expect(manager.revision(BIT_MASK_ALL)).toBe(3);
  });

  it('is pure: repeated reads without a delivery return an Object.is-stable value', async () => {
    // useSyncExternalStore requires getSnapshot to be stable between changes,
    // otherwise it would loop; revision() must satisfy that contract.
    const manager = new EventCascadeManager(getInfo);
    manager.publish(NodeEventType.UpdateValue);
    await drain();

    const r1 = manager.revision(NodeEventType.UpdateValue);
    const r2 = manager.revision(NodeEventType.UpdateValue);
    expect(Object.is(r1, r2)).toBe(true);
    // A subsequent delivery advances it (proves it was not frozen).
    manager.publish(NodeEventType.UpdateValue);
    await drain();
    expect(manager.revision(NodeEventType.UpdateValue)).toBe(r1 + 1);
  });

  it('records exactly one delivery per type when a listener re-publishes reentrantly', async () => {
    const manager = new EventCascadeManager(getInfo);
    let reentered = false;
    manager.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateValue && !reentered) {
        reentered = true;
        manager.publish(NodeEventType.UpdateState); // reentrant publish
      }
    });

    manager.publish(NodeEventType.UpdateValue);
    await drain();
    await drain();

    expect(manager.revision(NodeEventType.UpdateValue)).toBe(1);
    expect(manager.revision(NodeEventType.UpdateState)).toBe(1);
  });
});
