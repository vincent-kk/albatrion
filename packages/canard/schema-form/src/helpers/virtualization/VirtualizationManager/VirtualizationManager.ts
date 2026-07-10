import type { ComponentType } from 'react';

import type { Fn } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';

import { resolveVirtualizationOptions } from '../resolveVirtualizationOptions';
import {
  type ResolvedVirtualizationOptions,
  VirtualizationBackfill,
  type VirtualizationOptions,
  type VirtualizationPlaceholderProps,
} from '../type';
import { type IdleDeadlineLike, scheduleIdle } from './scheduleIdle';

/** Maximum reveals per idle slice, bounding the size of a single React commit */
const MAX_REVEALS_PER_SLICE = 25;
/** Minimum remaining idle budget (ms) required to keep revealing within a slice */
const MIN_IDLE_BUDGET_MS = 4;

/**
 * Per-form coordinator for render-level virtualization (deferred mount).
 *
 * Holds one shared IntersectionObserver and one idle backfill pump for all
 * deferred placeholders of a form, plus the reveal ledger that keeps
 * once-revealed nodes eager across ChildComponent cache rebuilds.
 *
 * Gating decisions are exposed as self-selecting methods (`forBranch`,
 * `forChild`) that return the manager itself or `null`, so consumers compose
 * them with optional chaining instead of re-reading option values.
 *
 * @remarks React-free by design; consumed via VirtualizationContext.
 *          Reveal is one-way (defer-once): a revealed node never returns
 *          to a placeholder.
 */
export class VirtualizationManager {
  /** Custom placeholder visual for deferred fields, null for the bare box */
  public readonly Placeholder: ComponentType<VirtualizationPlaceholderProps> | null;

  /** Resolved virtualization options this manager was created with */
  private readonly options: ResolvedVirtualizationOptions;

  /** Deferred placeholders awaiting reveal, in registration order */
  private readonly registry = new Map<Element, Fn>();

  /** Nodes revealed at least once — survives ChildComponent cache rebuilds (e.g. array renumbering) */
  private readonly revealedNodes = new WeakSet<SchemaNode>();

  /** Shared IntersectionObserver, lazily created on first register */
  private observer: IntersectionObserver | null = null;

  /** Cancel handle for the pending idle tick, null when the pump is stopped */
  private cancelIdle: Fn | null = null;

  /**
   * This manager when a branch with `childCount` children qualifies for
   * gating, else null.
   * @example `const gateManager = manager?.forBranch(children.length) ?? null;`
   */
  public forBranch(childCount: number): VirtualizationManager | null {
    return childCount >= this.options.threshold ? this : null;
  }

  /**
   * This manager when the child at `renderedIndex` should mount deferred —
   * beyond the eager window and never revealed before — else null.
   * @example `const deferredManager = gateManager?.forChild(index, node) ?? null;`
   */
  public forChild(
    renderedIndex: number,
    node: SchemaNode,
  ): VirtualizationManager | null {
    return renderedIndex >= this.options.eagerCount &&
      !this.revealedNodes.has(node)
      ? this
      : null;
  }

  /** Placeholder height (px) for a node before reveal */
  public estimateHeight(node: SchemaNode): number {
    const estimate = this.options.estimateHeight;
    return typeof estimate === 'function' ? estimate(node) : estimate;
  }

  /**
   * Track a placeholder element until it is revealed.
   * @remarks Idempotent; re-registering an element replaces its reveal callback.
   */
  public register(element: Element, reveal: Fn): void {
    this.registry.set(element, reveal);
    this.ensureObserver()?.observe(element);
    if (this.options.backfill === VirtualizationBackfill.Idle)
      this.ensureIdlePump();
  }

  /**
   * Stop tracking a placeholder element.
   * @remarks Idempotent; safe to call after the element was already revealed.
   */
  public unregister(element: Element): void {
    if (!this.registry.delete(element)) return;
    this.observer?.unobserve(element);
    if (this.registry.size === 0) this.stopIdlePump();
  }

  /** Whether the node has been revealed before (must stay eager on re-bake) */
  public hasRevealed(node: SchemaNode): boolean {
    return this.revealedNodes.has(node);
  }

  /** Record a node as revealed (one-way, idempotent) */
  public markRevealed(node: SchemaNode): void {
    this.revealedNodes.add(node);
  }

  /**
   * Release the observer and pending idle work.
   * @remarks Idempotent and resumable: a later register() restarts both the
   *          observation and the idle pump (StrictMode remount support).
   */
  public disconnect(): void {
    this.stopIdlePump();
    this.observer?.disconnect();
    this.registry.clear();
  }

  /** Reveal a tracked element: drop it from the registry and run its callback */
  private reveal(element: Element): void {
    const reveal = this.registry.get(element);
    if (reveal === undefined) return;
    this.registry.delete(element);
    this.observer?.unobserve(element);
    if (this.registry.size === 0) this.stopIdlePump();
    reveal();
  }

  private handleIntersections: IntersectionObserverCallback = (entries) => {
    for (let index = 0, length = entries.length; index < length; index++) {
      const entry = entries[index];
      if (entry.isIntersecting) this.reveal(entry.target);
    }
  };

  private ensureObserver(): IntersectionObserver | null {
    if (this.observer !== null) return this.observer;
    if (typeof IntersectionObserver === 'undefined') return null;
    this.observer = new IntersectionObserver(this.handleIntersections, {
      rootMargin: this.options.rootMargin,
    });
    return this.observer;
  }

  private idleTick = (deadline: IdleDeadlineLike): void => {
    this.cancelIdle = null;
    const iterator = this.registry.keys();
    let reveals = 0;
    while (
      reveals < MAX_REVEALS_PER_SLICE &&
      this.registry.size > 0 &&
      (deadline.didTimeout || deadline.timeRemaining() > MIN_IDLE_BUDGET_MS)
    ) {
      const next = iterator.next();
      if (next.done) break;
      this.reveal(next.value);
      reveals++;
    }
    if (this.registry.size > 0) this.ensureIdlePump();
  };

  private ensureIdlePump(): void {
    if (this.cancelIdle !== null || this.registry.size === 0) return;
    this.cancelIdle = scheduleIdle(this.idleTick);
  }

  private stopIdlePump(): void {
    if (this.cancelIdle === null) return;
    this.cancelIdle();
    this.cancelIdle = null;
  }

  /**
   * Create a manager for the `virtualization` form prop.
   * @param input - `true` for defaults, an options object for overrides, falsy to disable
   * @returns Manager, or null when virtualization is disabled or
   *          IntersectionObserver is unavailable (e.g. SSR) — null propagates
   *          through the context so no gate is ever created
   */
  public static create(
    input: boolean | VirtualizationOptions | undefined,
  ): VirtualizationManager | null {
    if (typeof IntersectionObserver === 'undefined') return null;
    const options = resolveVirtualizationOptions(input);
    return options === null ? null : new VirtualizationManager(options);
  }

  constructor(options: ResolvedVirtualizationOptions) {
    this.options = options;
    this.Placeholder = options.Placeholder;
  }
}
