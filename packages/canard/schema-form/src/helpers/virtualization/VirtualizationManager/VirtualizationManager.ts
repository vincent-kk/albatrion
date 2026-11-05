import type { ComponentType } from 'react';

import { isReactComponent } from '@winglet/react-utils/filter';
import { withErrorBoundary } from '@winglet/react-utils/hoc';

import type { Fn, Nullable, Optional } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import { FormWarningCode } from '@/schema-form/errors';
import { warnDevelopmentIssue } from '@/schema-form/helpers/warning';
import { usePlaceholderBoundaryReporter } from '@/schema-form/providers/FormErrorContext';

import {
  type ResolvedVirtualizationOptions,
  VirtualizationBackfill,
  type VirtualizationOptions,
  type VirtualizationPlaceholderProps,
  resolveVirtualizationOptions,
} from '../resolveVirtualizationOptions';
import type { DeferredGate } from './types/deferredGate';
import { findRevealPath } from './utils/findRevealPath';
import { formatVirtualizationDisabledWarning } from './utils/formatVirtualizationDisabledWarning';
import { type IdleDeadlineLike, scheduleIdle } from './utils/scheduleIdle';

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
  public readonly Placeholder: Nullable<
    ComponentType<VirtualizationPlaceholderProps>
  >;

  /** Resolved virtualization options this manager was created with */
  private readonly options: ResolvedVirtualizationOptions;

  /** Deferred placeholders awaiting reveal, in registration order */
  private readonly registry = new Map<Element, DeferredGate>();

  /** Gates opened but not yet removed by their commit ref callback. */
  private readonly revealing = new Map<Element, DeferredGate>();

  /** One active focus reveal, installed before a potentially synchronous commit. */
  private trackedReveal:
    | { element: Element; gate: DeferredGate; onSettled: Fn }
    | undefined;

  /** Input containers keyed by position; only focus requests search by node. */
  private readonly inputs = new Map<Element, FieldNode>();

  /** Nodes revealed at least once — survives ChildComponent cache rebuilds (e.g. array renumbering) */
  private readonly revealedNodes = new WeakSet<FieldNode>();

  /** Shared IntersectionObserver, lazily created on first register */
  private observer: Nullable<IntersectionObserver> = null;

  /** Cancel handle for the pending idle tick, null when the pump is stopped */
  private cancelIdle: Nullable<Fn> = null;

  /**
   * This manager when a branch with `childCount` children qualifies for
   * gating, else null.
   * @example `const gateManager = manager?.forBranch(children.length) ?? null;`
   */
  public forBranch(childCount: number): Nullable<VirtualizationManager> {
    return childCount >= this.options.threshold ? this : null;
  }

  /**
   * This manager when the child at `renderedIndex` should mount deferred —
   * beyond the eager window and never revealed before — else null.
   * @example `const deferredManager = gateManager?.forChild(index, node) ?? null;`
   */
  public forChild(
    renderedIndex: number,
    node: FieldNode,
  ): Nullable<VirtualizationManager> {
    return renderedIndex >= this.options.eagerCount &&
      !this.revealedNodes.has(node)
      ? this
      : null;
  }

  /** Placeholder height (px) for a node before reveal */
  public estimateHeight(node: FieldNode): number {
    const estimate = this.options.estimateHeight;
    return typeof estimate === 'function' ? estimate(node) : estimate;
  }

  /**
   * Track a placeholder element until it is revealed.
   * @remarks Idempotent; re-registering an element replaces its reveal callback.
   */
  public register(element: Element, gate: DeferredGate): void {
    this.registry.set(element, gate);
    this.ensureObserver()?.observe(element);
    if (this.options.backfill === VirtualizationBackfill.Idle)
      this.ensureIdlePump();
  }

  /**
   * Stop tracking a placeholder element.
   * @remarks Idempotent; safe to call after the element was already revealed.
   */
  public unregister(element: Element): void {
    this.revealing.delete(element);
    if (!this.registry.delete(element)) return;
    this.observer?.unobserve(element);
    if (this.registry.size === 0) this.stopIdlePump();
  }

  /**
   * Register a real input container; replacing the same position is idempotent.
   * @param element - Mounted input position, distinct from its renderer wrapper.
   * @param node - Field rendered by this input position.
   * @returns Nothing; focus lookup can now find this position.
   */
  public attachInput(element: Element, node: FieldNode): void {
    this.inputs.set(element, node);
  }

  /**
   * Release the input position captured by its layout effect.
   * @param element - Position whose input effect is being cleaned up.
   * @returns Nothing; repeated removal is harmless.
   */
  public detachInput(element: Element): void {
    this.inputs.delete(element);
  }

  /**
   * Find this field's input containers only when focus is requested.
   * @param node - Exact field identity; paths do not distinguish duplicate positions.
   * @returns Matching containers in registration order, empty when none are mounted.
   */
  public inputsOf(node: FieldNode): Element[] {
    const elements: Element[] = [];
    for (const [element, input] of this.inputs)
      if (input === node) elements.push(element);
    return elements;
  }

  /** Whether the node has been revealed before (must stay eager on re-bake) */
  public hasRevealed(node: FieldNode): boolean {
    return this.revealedNodes.has(node);
  }

  /** Record a node as revealed (one-way, idempotent) */
  public markRevealed(node: FieldNode): void {
    this.revealedNodes.add(node);
  }

  /**
   * Mark the target render path and open its first gate.
   * @param target - Present field whose physical and virtual render ancestors are searched.
   * @param onSettled - Called when the tracked gate commits or its removal is confirmed.
   * @returns Whether a blocking gate was found, including one already opening.
   */
  public revealPath(target: FieldNode, onSettled: Fn): boolean {
    const path = findRevealPath(target, this.registry, this.revealing);
    if (!path) return false;
    for (const node of path.renderPath) this.revealedNodes.add(node);
    this.trackedReveal = {
      element: path.element,
      gate: path.gate,
      onSettled,
    };
    if (this.registry.has(path.element)) this.reveal(path.element);
    return true;
  }

  /**
   * Settle after child input layout effects have consumed the target Mount queue.
   * @param gate - Stable object belonging to the position that committed the reveal.
   * @returns Nothing; another position of the same field cannot settle this request.
   */
  public settleReveal(gate: DeferredGate): void {
    const tracked = this.trackedReveal;
    if (!tracked || tracked.gate !== gate) return;
    this.trackedReveal = undefined;
    tracked.onSettled();
  }

  /**
   * Confirm removal after synchronous effect replay has had a chance to register again.
   * @param element - Placeholder position released by its owning effect cleanup.
   * @returns Nothing; a microtask settles only the same still-absent tracked position.
   */
  public releaseGate(element: Element): void {
    const tracked = this.trackedReveal;
    if (!tracked || tracked.element !== element) return;
    queueMicrotask(() => {
      if (
        this.trackedReveal !== tracked ||
        this.registry.has(element) ||
        this.revealing.has(element)
      )
        return;
      this.trackedReveal = undefined;
      tracked.onSettled();
    });
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
    const gate = this.registry.get(element);
    if (gate === undefined) return;
    this.registry.delete(element);
    this.revealing.set(element, gate);
    this.observer?.unobserve(element);
    if (this.registry.size === 0) this.stopIdlePump();
    gate.reveal();
  }

  private handleIntersections: IntersectionObserverCallback = (entries) => {
    for (let index = 0, length = entries.length; index < length; index++) {
      const entry = entries[index];
      if (entry.isIntersecting) this.reveal(entry.target);
    }
  };

  private ensureObserver(): Nullable<IntersectionObserver> {
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
    input: Optional<boolean | VirtualizationOptions>,
  ): Nullable<VirtualizationManager> {
    if (typeof IntersectionObserver === 'undefined') {
      if (input && typeof window !== 'undefined')
        warnDevelopmentIssue({
          code: FormWarningCode.VirtualizationDisabledForForm,
          message: formatVirtualizationDisabledWarning(),
        });
      return null;
    }
    const options = resolveVirtualizationOptions(input);
    return options === null ? null : new VirtualizationManager(options);
  }

  constructor(options: ResolvedVirtualizationOptions) {
    this.options = options;
    this.Placeholder = isReactComponent(options.Placeholder)
      ? withErrorBoundary(
          options.Placeholder,
          undefined,
          usePlaceholderBoundaryReporter,
        )
      : null;
  }
}
