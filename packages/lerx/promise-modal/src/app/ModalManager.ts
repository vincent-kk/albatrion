import { map } from '@winglet/common-utils/array';
import { getRandomString } from '@winglet/common-utils/lib';
import {
  destroyScope,
  styleManagerFactory,
} from '@winglet/style-utils/style-manager';
import { compressCss } from '@winglet/style-utils/util';

import type { Fn } from '@aileron/declare';

import type { ModalNode } from '@/promise-modal/core';
import { closeModal } from '@/promise-modal/helpers/closeModal';
import type { Modal } from '@/promise-modal/types/modal';

import { getModalManagerState } from './helpers/getModalManagerState/getModalManagerState';
import { getTabbableElements } from './utils/getTabbableElements';

/** Owns global DOM effects and the external modal store; styles are lazy for SSR. */
export class ModalManager {
  /** Compatible package copies resolve to one runtime-owned state object. */
  private static readonly __state__ = getModalManagerState();

  /** Returns stable ids until membership changes. */
  static get ids(): readonly number[] {
    return ModalManager.__state__.ids;
  }
  /** Advances only on registration, so an error boundary cannot reset on cleanup. */
  static get registrationVersion() {
    return ModalManager.__state__.registrationVersion;
  }
  /** Returns a live node without exposing the mutable dictionary. */
  static node(id: number) {
    return ModalManager.__state__.nodes.get(id);
  }
  /** Allocates ids across provider handoffs and remounts. */
  static nextId() {
    return ModalManager.__state__.id++;
  }
  /** Subscribes React readers to publications and membership changes. */
  static subscribe(listener: Fn): Fn {
    ModalManager.__state__.listeners.add(listener);
    return () => {
      ModalManager.__state__.listeners.delete(listener);
    };
  }
  /** Publishes the external store after a node or membership change. */
  private static notify() {
    for (const listener of ModalManager.__state__.listeners) listener();
  }
  /** Tracks a node until destruction, including changes to hidden nodes. */
  static register(node: ModalNode): void {
    if (ModalManager.__state__.nodes.has(node.id)) return;
    node.order = ++ModalManager.__state__.order;
    ModalManager.__state__.nodes.set(node.id, node);
    if (typeof document !== 'undefined')
      ModalManager.__state__.focusTargets.set(node.id, document.activeElement);
    ModalManager.__state__.ids = [...ModalManager.__state__.nodes.keys()];
    ModalManager.__state__.registrationVersion++;
    ModalManager.__state__.nodeCleanups.set(
      node.id,
      node.subscribe(() => {
        const restore =
          node.settled && ModalManager.__state__.focusTargets.has(node.id);
        const target = ModalManager.__state__.focusTargets.get(node.id);
        if (restore) ModalManager.__state__.focusTargets.delete(node.id);
        if (!node.alive) {
          ModalManager.__state__.nodeCleanups.get(node.id)?.();
          ModalManager.__state__.nodeCleanups.delete(node.id);
          ModalManager.__state__.nodes.delete(node.id);
          ModalManager.__state__.ids = [...ModalManager.__state__.nodes.keys()];
          if (!ModalManager.__state__.ids.length)
            ModalManager.__state__.order = 0;
        }
        ModalManager.updateAccessibility();
        if (restore && node.dimmed) ModalManager.restoreFocus(node.id, target);
        ModalManager.notify();
      }),
    );
    ModalManager.updateAccessibility();
    ModalManager.notify();
  }
  /** Brings an existing node forward without publishing when already on top. */
  static raise(id: number): void {
    const node = ModalManager.node(id);
    if (!node || node.order === ModalManager.__state__.order) return;
    node.order = ++ModalManager.__state__.order;
    node.publish();
  }
  /** Creates or moves the one anchor; callers never perform global DOM effects. */
  static anchor(options?: {
    tag?: string;
    prefix?: string;
    root?: HTMLElement;
  }): HTMLElement {
    const {
      tag = 'div',
      prefix = 'promise-modal',
      root = document.body,
    } = options || {};
    if (!ModalManager.__state__.anchor) {
      const node = document.createElement(tag);
      node.id = `${prefix}-${getRandomString(36)}`;
      node.className = ModalManager.__state__.scope;
      ModalManager.__state__.anchor = node;
    }
    if (ModalManager.__state__.anchor.parentElement !== root)
      root.appendChild(ModalManager.__state__.anchor);
    ModalManager.flushPrerender();
    return ModalManager.__state__.anchor;
  }
  /** Whether an anchor exists for the current owner. */
  static get anchored() {
    return ModalManager.__state__.anchor !== null;
  }
  /** Registers an owner or waiter and notifies only the active bootstrap. */
  static attach(
    identity: object,
    root: HTMLElement | null,
    notify: Fn<[HTMLElement | null]>,
  ): void {
    if (root === null) {
      if (ModalManager.__state__.owner === identity) {
        ModalManager.__state__.bootstraps.set(identity, { root, notify });
        ModalManager.releasePageEffects();
        ModalManager.__state__.focused.clear();
        ModalManager.__state__.anchor?.remove();
      } else ModalManager.__state__.bootstraps.delete(identity);
      return;
    }
    ModalManager.__state__.bootstraps.set(identity, { root, notify });
    if (
      ModalManager.__state__.owner &&
      ModalManager.__state__.owner !== identity
    ) {
      if (
        !ModalManager.__state__.warned.has(identity) &&
        process.env.NODE_ENV !== 'production'
      )
        console.warn(
          '[promise-modal] Another provider owns the portal; this provider waits until its owner unmounts.',
        );
      ModalManager.__state__.warned.add(identity);
      return;
    }
    ModalManager.__state__.owner = identity;
    ModalManager.__state__.generation++;
    const anchor = ModalManager.anchor({ root });
    ModalManager.applyStyleSheet();
    ModalManager.installKeyboardListener();
    ModalManager.updateAccessibility(true);
    notify(anchor);
  }
  /** Detaches only this bootstrap; defers cancellation to preserve same-commit remounts. */
  static detach(identity: object): void {
    const bootstrap = ModalManager.__state__.bootstraps.get(identity);
    ModalManager.__state__.bootstraps.delete(identity);
    if (ModalManager.__state__.owner !== identity) return;
    ModalManager.__state__.owner = null;
    ModalManager.removeKeyboardListener();
    ModalManager.releasePageEffects();
    ModalManager.__state__.focused.clear();
    ModalManager.__state__.anchor?.remove();
    ModalManager.__state__.anchor = null;
    ModalManager.destroyStyleSheet();
    bootstrap?.notify(null);
    const next = ModalManager.__state__.bootstraps.entries().next().value;
    if (next) {
      ModalManager.attach(next[0], next[1].root, next[1].notify);
      return;
    }
    const generation = ModalManager.__state__.generation;
    queueMicrotask(() => {
      if (generation !== ModalManager.__state__.generation) return;
      for (const node of [...ModalManager.__state__.nodes.values()])
        if (node.alive) node.onDestroy();
    });
  }
  /**
   * Registers the library-owned focus boundary and reevaluates committed UI.
   * @param id - Registered modal identity supplied by its foreground presenter.
   * @param element - Mounted outer wrapper, or null to release its reference.
   */
  static setFrameElement(id: number, element: HTMLElement | null): void {
    if (element) ModalManager.__state__.frames.set(id, element);
    else ModalManager.__state__.frames.delete(id);
    ModalManager.updateAccessibility(true);
  }
  /** Reads pending visible nodes in descending visual order. */
  private static visibleNodes(): ModalNode[] {
    return [...ModalManager.__state__.nodes.values()]
      .filter((node) => node.alive && node.visible && !node.settled)
      .sort((left, right) => right.order - left.order);
  }
  /**
   * Focuses a frame's first control, preserving an existing internal focus target.
   * @param id - Pending dimmed modal whose wrapper may already be registered.
   */
  private static focusFrame(id: number): void {
    const frame = ModalManager.__state__.frames.get(id);
    if (!frame?.isConnected || frame.contains(document.activeElement)) return;
    (getTabbableElements(frame)[0] ?? frame).focus();
  }
  /**
   * Restores an opener after page effects change, without stealing a peer's focus.
   * @param id - Settled or released modal to exclude from pending peer checks.
   * @param target - Registration-time opener; disconnected elements are ignored.
   */
  private static restoreFocus(
    id: number,
    target: Element | null | undefined,
  ): void {
    if (typeof document === 'undefined') return;
    const pending = ModalManager.visibleNodes().filter(
      (node) => node.id !== id,
    );
    const remaining = pending.filter((node) => node.dimmed);
    if (
      pending.some((node) =>
        ModalManager.__state__.frames
          .get(node.id)
          ?.contains(document.activeElement),
      )
    )
      return;
    if (
      target?.isConnected &&
      !target.closest('[inert]') &&
      'focus' in target &&
      typeof target.focus === 'function'
    )
      target.focus();
    else if (target?.closest('[inert]') && remaining[0])
      ModalManager.focusFrame(remaining[0].id);
  }
  /**
   * Applies isolation before moving focus; detached roots do not affect the page.
   * @param moveFocus - Node publication alone only updates page effects; after
   * DOM commit, the frame layout effect moves focus once on route reappearance.
   * Anchor attachment also permits focus movement into already committed UI.
   */
  private static updateAccessibility(moveFocus = false): void {
    if (typeof document === 'undefined') return;
    const root = ModalManager.__state__.anchor?.isConnected
      ? ModalManager.__state__.anchor.parentElement
      : null;
    const nodes = root
      ? ModalManager.visibleNodes().filter((node) => node.dimmed)
      : [];
    for (const id of ModalManager.__state__.focused)
      if (!nodes.some((node) => node.id === id))
        ModalManager.__state__.focused.delete(id);
    ModalManager.updateInert(nodes.length > 0 ? root : null);
    ModalManager.updateScrollLock(nodes.some((node) => node.lockScroll));
    if (!moveFocus) return;
    const top = nodes[0];
    if (
      top &&
      !ModalManager.__state__.focused.has(top.id) &&
      ModalManager.__state__.frames.get(top.id)?.isConnected
    ) {
      ModalManager.__state__.focused.add(top.id);
      ModalManager.focusFrame(top.id);
    }
  }
  /**
   * Snapshots ancestor-path siblings once, leaving later portal nodes interactive.
   * @param root - Attached anchor parent, or null to release owned attributes.
   */
  private static updateInert(root: HTMLElement | null): void {
    if (ModalManager.__state__.inertRoot === root) return;
    for (const element of ModalManager.__state__.inertElements)
      element.removeAttribute('inert');
    ModalManager.__state__.inertElements = [];
    ModalManager.__state__.inertRoot = root;
    if (!root) return;
    let branch = ModalManager.__state__.anchor;
    while (branch && branch !== document.body) {
      const parent = branch.parentElement;
      if (!parent) break;
      for (const sibling of parent.children)
        if (sibling !== branch && !sibling.hasAttribute('inert')) {
          sibling.setAttribute('inert', '');
          ModalManager.__state__.inertElements.push(sibling);
        }
      branch = parent;
    }
  }
  /**
   * Preserves inline CSS and compensates only plausible browser scrollbar widths.
   * @param locked - Whether any visible pending dimmed modal requests a lock.
   */
  private static updateScrollLock(locked: boolean): void {
    const style = document.body.style;
    const previous = ModalManager.__state__.scrollStyle;
    if (locked && !previous) {
      ModalManager.__state__.scrollStyle = {
        overflow: style.getPropertyValue('overflow'),
        overflowPriority: style.getPropertyPriority('overflow'),
        padding: style.getPropertyValue('padding-right'),
        paddingPriority: style.getPropertyPriority('padding-right'),
      };
      const width = window.innerWidth - document.documentElement.clientWidth;
      if (width > 0 && width < 100)
        style.setProperty(
          'padding-right',
          `${(parseFloat(window.getComputedStyle(document.body).paddingRight) || 0) + width}px`,
        );
      style.setProperty('overflow', 'hidden');
    } else if (!locked && previous) {
      if (previous.overflow)
        style.setProperty(
          'overflow',
          previous.overflow,
          previous.overflowPriority,
        );
      else style.removeProperty('overflow');
      if (previous.padding)
        style.setProperty(
          'padding-right',
          previous.padding,
          previous.paddingPriority,
        );
      else style.removeProperty('padding-right');
      ModalManager.__state__.scrollStyle = undefined;
    }
  }
  /** Reverts page mutations before detach, root changes, or test reset. */
  private static releasePageEffects(): void {
    ModalManager.updateInert(null);
    if (typeof document !== 'undefined') ModalManager.updateScrollLock(false);
  }
  /** Installs exactly one bubbling document listener so controls may prevent defaults. */
  private static installKeyboardListener(): void {
    if (ModalManager.__state__.keydown) return;
    ModalManager.__state__.keydown = (event) => {
      if (
        !ModalManager.__state__.anchor?.isConnected ||
        event.defaultPrevented ||
        event.isComposing ||
        event.keyCode === 229
      )
        return;
      const nodes = ModalManager.visibleNodes();
      if (event.key === 'Escape') {
        for (const node of nodes) {
          if (node.closeOnEscape) {
            event.preventDefault();
            closeModal(node);
            break;
          }
          if (node.dimmed) break;
        }
      } else if (event.key === 'Tab') {
        const top = nodes[0];
        if (top?.dimmed && top.trapFocus) ModalManager.trapTab(event, top.id);
      }
    };
    document.addEventListener('keydown', ModalManager.__state__.keydown);
  }
  /**
   * Cycles the top frame's keyboard boundary; native navigation handles middle items.
   * @param event - Unprevented non-composing Tab event from the shared listener.
   * @param id - Top participating modal with focus trapping enabled.
   */
  private static trapTab(event: KeyboardEvent, id: number): void {
    const frame = ModalManager.__state__.frames.get(id);
    if (!frame?.isConnected) return;
    const controls = getTabbableElements(frame, event.shiftKey);
    const first = controls[0] ?? frame;
    const last = controls[controls.length - 1] ?? frame;
    const current = document.activeElement;
    if (
      !frame.contains(current) ||
      current === frame ||
      (event.shiftKey ? current === first : current === last)
    ) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  }
  /** Releases the same callback installed by the current owner. */
  private static removeKeyboardListener(): void {
    if (!ModalManager.__state__.keydown) return;
    document.removeEventListener('keydown', ModalManager.__state__.keydown);
    ModalManager.__state__.keydown = undefined;
  }
  /** Provides a read-only copy of requests waiting for initialization. */
  static get prerender(): Modal[] {
    return map(ModalManager.__state__.prerenderList, (entry) => entry.modal);
  }
  /** Installs a handler and delivers queued requests with their original Promise channels. */
  static set openHandler(handler: Fn<[Modal], ModalNode>) {
    ModalManager.__state__.openHandler = handler;
    ModalManager.flushPrerender();
  }
  /** Restores queueing only if the effect being cleaned up still owns the handler. */
  static releaseOpenHandler(handler: Fn<[Modal], ModalNode>): void {
    if (ModalManager.__state__.openHandler === handler)
      ModalManager.__state__.openHandler =
        ModalManager.__state__.defaultOpenHandler;
  }
  /** Flushes independent queue items, forwarding errors rather than swallowing them. */
  private static flushPrerender(): void {
    if (
      ModalManager.__state__.openHandler ===
        ModalManager.__state__.defaultOpenHandler ||
      !ModalManager.__state__.anchor?.parentElement
    )
      return;
    const entries = ModalManager.__state__.prerenderList;
    ModalManager.__state__.prerenderList = [];
    for (const entry of entries)
      try {
        if (entry.dispatch) entry.dispatch();
        else ModalManager.__state__.openHandler(entry.modal);
      } catch (error) {
        entry.modal.handleReject?.(error);
      }
  }
  /** Adds a live-node dispatcher to an already queued request. */
  static bindPrerender(modal: Modal, dispatch: Fn): void {
    const entry = ModalManager.__state__.prerenderList.find(
      (entry) => entry.modal === modal,
    );
    if (entry) entry.dispatch = dispatch;
  }
  /** Removes a pre-mount request after cancellation. */
  static cancelPrerender(modal: Modal): boolean {
    const index = ModalManager.__state__.prerenderList.findIndex(
      (entry) => entry.modal === modal,
    );
    if (index < 0) return false;
    ModalManager.__state__.prerenderList.splice(index, 1);
    return true;
  }
  /** Records compressed CSS without reading the DOM. */
  static defineStyleSheet(styleId: string, css: string): void {
    ModalManager.__state__.styleSheetDefinition.set(styleId, compressCss(css));
  }
  /** Creates a style manager only at browser initialization. */
  static applyStyleSheet(): void {
    ModalManager.__state__.styleManager ??= styleManagerFactory(
      ModalManager.__state__.scope,
    );
    for (const [styleId, css] of ModalManager.__state__.styleSheetDefinition)
      ModalManager.__state__.styleManager(styleId, css, true);
  }
  /** Discards the captured scope manager so a later attach can rebuild styles. */
  private static destroyStyleSheet(): void {
    if (!ModalManager.__state__.styleManager) return;
    destroyScope(ModalManager.__state__.scope);
    ModalManager.__state__.styleManager = undefined;
  }
  /** Computes class names in browser and server environments alike. */
  static getHashedClassNames(styleId: string): string {
    return `${styleId}-${ModalManager.__state__.hash}`;
  }
  /** Test-only reset skips settlement to prevent cross-test callbacks; detach owns provider teardown cancellation. */
  static reset(): void {
    ModalManager.__state__.generation++;
    ModalManager.removeKeyboardListener();
    ModalManager.releasePageEffects();
    for (const [id, target] of [
      ...ModalManager.__state__.focusTargets,
    ].reverse())
      if (ModalManager.node(id)?.dimmed) ModalManager.restoreFocus(id, target);
    ModalManager.__state__.focusTargets.clear();
    ModalManager.__state__.frames.clear();
    ModalManager.__state__.focused.clear();
    ModalManager.__state__.anchor?.remove();
    ModalManager.__state__.anchor = null;
    ModalManager.destroyStyleSheet();
    ModalManager.__state__.prerenderList = [];
    ModalManager.__state__.openHandler =
      ModalManager.__state__.defaultOpenHandler;
    for (const cleanup of ModalManager.__state__.nodeCleanups.values())
      cleanup();
    ModalManager.__state__.nodeCleanups.clear();
    ModalManager.__state__.nodes.clear();
    ModalManager.__state__.ids = [];
    ModalManager.__state__.id =
      ModalManager.__state__.order =
      ModalManager.__state__.registrationVersion =
        0;
    ModalManager.__state__.owner = null;
    for (const bootstrap of ModalManager.__state__.bootstraps.values())
      bootstrap.notify(null);
    ModalManager.__state__.bootstraps.clear();
    ModalManager.__state__.warned = new WeakSet();
    ModalManager.notify();
    ModalManager.__state__.listeners.clear();
  }
  /** Opens through the current handler or queues until one is installed. */
  static open(modal: Modal): ModalNode | undefined {
    return ModalManager.__state__.anchor?.parentElement
      ? ModalManager.__state__.openHandler(modal)
      : ModalManager.__state__.defaultOpenHandler(modal);
  }
}
