import type { Fn } from '@aileron/declare';

import { BIT_MASK_NONE } from '@/schema-form/constants/bitmask';
import type { FieldNode } from '@/schema-form/core';

import { FieldLifecycle } from '../constants/FieldLifecycle';
import { FieldLifecycleAction } from '../constants/FieldLifecycleAction';
import type { FieldLifecycleHandler } from '../types/fieldLifecycle';

/** Cancellation remains visible after the queue is detached from its Map. */
interface Entry {
  /** False after cancellation or execution. */
  active: boolean;
  /** Pure action producer owned by this reservation. */
  handler: FieldLifecycleHandler;
}

/** One-shot field queues; React and DOM lifetimes belong to the caller. */
export class FieldLifecycleRegistry {
  /** One map per independent lifecycle point. */
  private readonly queues = {
    [FieldLifecycle.Mount]: new Map<FieldNode, Entry[]>(),
    [FieldLifecycle.Unmount]: new Map<FieldNode, Entry[]>(),
    [FieldLifecycle.Render]: new Map<FieldNode, Entry[]>(),
  };
  /** Updated on queue changes so idle consumers perform only a property read. */
  private pendingMask = BIT_MASK_NONE;
  /** Consumer-owned nonthrowing error sink. */
  private readonly onHandlerError: (error: unknown, node: FieldNode) => void;

  /** @param onHandlerError - Reports handler failures and must never throw. */
  constructor(onHandlerError: (error: unknown, node: FieldNode) => void) {
    this.onHandlerError = onHandlerError;
  }

  /** Bitmask of points with queued handlers; zero on the idle path. */
  get pending(): number {
    return this.pendingMask;
  }

  /**
   * Check queued work without consuming it.
   * @param node - Identity whose reservations are queried.
   * @param lifecycle - One lifecycle point, never a combined mask.
   * @returns Whether this node has a nonempty queue at that point.
   */
  has(node: FieldNode, lifecycle: FieldLifecycle): boolean {
    return this.queues[lifecycle].has(node);
  }

  /**
   * Append a pure handler to this node's FIFO queue.
   * @param node - Identity whose next lifecycle event consumes the reservation.
   * @param lifecycle - One lifecycle point, never a combined mask.
   * @param handler - Pure action producer; failures reach the nonthrowing error sink.
   * @returns Idempotent cancellation, also effective before execution in a detached queue.
   */
  reserve(
    node: FieldNode,
    lifecycle: FieldLifecycle,
    handler: FieldLifecycleHandler,
  ): Fn {
    const map = this.queues[lifecycle];
    let queue = map.get(node);
    if (!queue) map.set(node, (queue = []));
    const entry: Entry = { active: true, handler };
    queue.push(entry);
    this.pendingMask |= lifecycle;
    return () => {
      if (!entry.active) return;
      entry.active = false;
      if (map.get(node) !== queue) return;
      queue.splice(queue.indexOf(entry), 1);
      if (queue.length === 0) map.delete(node);
      if (map.size === 0) this.pendingMask &= ~lifecycle;
    };
  }

  /**
   * Detach the queue before FIFO execution so re-reservations wait for the next event.
   * @param node - Identity whose pending queue is consumed.
   * @param lifecycle - One lifecycle point, never a combined mask.
   * @returns Combined actions of uncancelled successful handlers, or None for an empty queue.
   */
  fire(node: FieldNode, lifecycle: FieldLifecycle): FieldLifecycleAction {
    const map = this.queues[lifecycle];
    const queue = map.get(node);
    if (!queue) return FieldLifecycleAction.None;
    map.delete(node);
    if (map.size === 0) this.pendingMask &= ~lifecycle;
    const event = Object.freeze({ node, type: lifecycle });
    let action = FieldLifecycleAction.None;
    for (const entry of queue) {
      if (!entry.active) continue;
      entry.active = false;
      try {
        action |= entry.handler(event);
      } catch (error) {
        this.onHandlerError(error, node);
      }
    }
    return action;
  }
}
