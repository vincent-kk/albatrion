import { map } from '@winglet/common-utils/array';
import { polynomialHash } from '@winglet/common-utils/hash';
import { getRandomString } from '@winglet/common-utils/lib';
import {
  destroyScope,
  styleManagerFactory,
} from '@winglet/style-utils/style-manager';
import { compressCss } from '@winglet/style-utils/util';

import type { Fn } from '@aileron/declare';

import type { ModalNode } from '@/promise-modal/core';
import { closeModal } from '@/promise-modal/helpers/closeModal';
import type { Modal } from '@/promise-modal/types';

import { getTabbableElements } from './utils/getTabbableElements';

/** Queued requests retain both Promise channels while no portal is attached. */
interface PrerenderEntry {
  modal: Modal;
  dispatch?: Fn;
}
/** A bootstrap's identity and notification channel, independent of React trees. */
interface BootstrapOwner {
  root: HTMLElement | null;
  notify: Fn<[HTMLElement | null]>;
}

/** Owns global DOM effects and the external modal store; styles are lazy for SSR. */
export class ModalManager {
  /** Rendered wrappers provide focus boundaries without imposing frame semantics. */
  private static __frames__ = new Map<number, HTMLElement>();
  /** Registration captures the opener until the request first settles. */
  private static __focusTargets__ = new Map<number, Element | null>();
  /** Visible intervals receive initial focus only once. */
  private static __focused__ = new Set<number>();
  /** Only attributes introduced by this manager are removed on release. */
  private static __inertElements__: Element[] = [];
  /** The root where the current inert snapshot starts. */
  private static __inertRoot__: HTMLElement | null = null;
  /** Original inline properties, including priorities, survive scroll locking. */
  private static __scrollStyle__?: {
    overflow: string;
    overflowPriority: string;
    padding: string;
    paddingPriority: string;
  };
  /** The exact installed callback is shared by Escape and Tab handling. */
  private static __keydown__?: (event: KeyboardEvent) => void;
  /** The portal container belongs to the active bootstrap. */
  private static __anchor__: HTMLElement | null = null;
  /** A stable style scope survives provider handoffs. */
  private static __scope__ = `promise-modal-${getRandomString(36)}`;
  /** CSS class identity is computed without browser globals. */
  private static __hash__ = polynomialHash(ModalManager.__scope__);
  /** The scope manager exists only between browser attach and detach. */
  private static __styleManager__?: ReturnType<typeof styleManagerFactory>;
  /** Canonical CSS definitions survive detach for later initialization. */
  private static __styleSheetDefinition__ = new Map<string, string>();
  /** Alive nodes remain independent of the provider render tree. */
  private static __nodes__ = new Map<number, ModalNode>();
  /** Each registered node has one store-owned subscription. */
  private static __nodeCleanups__ = new Map<number, Fn>();
  /** Membership snapshot changes only on registration or removal. */
  private static __ids__: readonly number[] = [];
  /** External-store listeners observe node publications. */
  private static __listeners__ = new Set<Fn>();
  /** Ids remain unique across provider instances until test reset. */
  private static __id__ = 0;
  /** Stack positions increase until the store becomes empty. */
  private static __order__ = 0;
  /** Boundary recovery advances only when a new node registers. */
  private static __registrationVersion__ = 0;
  /** Initialization invalidates a previously scheduled detach cancellation. */
  private static __generation__ = 0;
  /** One identity at a time may render the portal. */
  private static __owner__: object | null = null;
  /** Development ownership warnings are limited to once per bootstrap. */
  private static __warned__ = new WeakSet<object>();
  /** Insertion order determines the next waiting owner. */
  private static __bootstraps__ = new Map<object, BootstrapOwner>();
  /** Pre-mount requests retain their settlement channels. */
  private static __prerenderList__: PrerenderEntry[] = [];
  /** Queue mode preserves requests while no React handler is installed. */
  private static __defaultOpenHandler__: Fn<[Modal], ModalNode | undefined> = (
    modal,
  ) => {
    ModalManager.__prerenderList__.push({ modal });
    return undefined;
  };
  /** The active layout effect owns this handler until its guarded cleanup. */
  private static __openHandler__ = ModalManager.__defaultOpenHandler__;

  /** Returns stable ids until membership changes. */
  static get ids(): readonly number[] {
    return ModalManager.__ids__;
  }
  /** Advances only on registration, so an error boundary cannot reset on cleanup. */
  static get registrationVersion() {
    return ModalManager.__registrationVersion__;
  }
  /** Returns a live node without exposing the mutable dictionary. */
  static node(id: number) {
    return ModalManager.__nodes__.get(id);
  }
  /** Allocates ids across provider handoffs and remounts. */
  static nextId() {
    return ModalManager.__id__++;
  }
  /** Subscribes React readers to publications and membership changes. */
  static subscribe(listener: Fn): Fn {
    ModalManager.__listeners__.add(listener);
    return () => {
      ModalManager.__listeners__.delete(listener);
    };
  }
  /** Publishes the external store after a node or membership change. */
  private static notify() {
    for (const listener of ModalManager.__listeners__) listener();
  }
  /** Tracks a node until destruction, including changes to hidden nodes. */
  static register(node: ModalNode): void {
    if (ModalManager.__nodes__.has(node.id)) return;
    node.order = ++ModalManager.__order__;
    ModalManager.__nodes__.set(node.id, node);
    if (typeof document !== 'undefined')
      ModalManager.__focusTargets__.set(node.id, document.activeElement);
    ModalManager.__ids__ = [...ModalManager.__nodes__.keys()];
    ModalManager.__registrationVersion__++;
    ModalManager.__nodeCleanups__.set(
      node.id,
      node.subscribe(() => {
        const restore =
          node.settled && ModalManager.__focusTargets__.has(node.id);
        const target = ModalManager.__focusTargets__.get(node.id);
        if (restore) ModalManager.__focusTargets__.delete(node.id);
        if (!node.alive) {
          ModalManager.__nodeCleanups__.get(node.id)?.();
          ModalManager.__nodeCleanups__.delete(node.id);
          ModalManager.__nodes__.delete(node.id);
          ModalManager.__ids__ = [...ModalManager.__nodes__.keys()];
          if (!ModalManager.__ids__.length) ModalManager.__order__ = 0;
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
    if (!node || node.order === ModalManager.__order__) return;
    node.order = ++ModalManager.__order__;
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
    if (!ModalManager.__anchor__) {
      const node = document.createElement(tag);
      node.id = `${prefix}-${getRandomString(36)}`;
      node.className = ModalManager.__scope__;
      ModalManager.__anchor__ = node;
    }
    if (ModalManager.__anchor__.parentElement !== root)
      root.appendChild(ModalManager.__anchor__);
    ModalManager.flushPrerender();
    return ModalManager.__anchor__;
  }
  /** Whether an anchor exists for the current owner. */
  static get anchored() {
    return ModalManager.__anchor__ !== null;
  }
  /** Registers an owner or waiter and notifies only the active bootstrap. */
  static attach(
    identity: object,
    root: HTMLElement | null,
    notify: Fn<[HTMLElement | null]>,
  ): void {
    if (root === null) {
      if (ModalManager.__owner__ === identity) {
        ModalManager.__bootstraps__.set(identity, { root, notify });
        ModalManager.releasePageEffects();
        ModalManager.__focused__.clear();
        ModalManager.__anchor__?.remove();
      } else ModalManager.__bootstraps__.delete(identity);
      return;
    }
    ModalManager.__bootstraps__.set(identity, { root, notify });
    if (ModalManager.__owner__ && ModalManager.__owner__ !== identity) {
      if (
        !ModalManager.__warned__.has(identity) &&
        process.env.NODE_ENV !== 'production'
      )
        console.warn(
          '[promise-modal] Another provider owns the portal; this provider waits until its owner unmounts.',
        );
      ModalManager.__warned__.add(identity);
      return;
    }
    ModalManager.__owner__ = identity;
    ModalManager.__generation__++;
    const anchor = ModalManager.anchor({ root });
    ModalManager.applyStyleSheet();
    ModalManager.installKeyboardListener();
    ModalManager.updateAccessibility(true);
    notify(anchor);
  }
  /** Detaches only this bootstrap; defers cancellation to preserve same-commit remounts. */
  static detach(identity: object): void {
    const bootstrap = ModalManager.__bootstraps__.get(identity);
    ModalManager.__bootstraps__.delete(identity);
    if (ModalManager.__owner__ !== identity) return;
    ModalManager.__owner__ = null;
    ModalManager.removeKeyboardListener();
    ModalManager.releasePageEffects();
    ModalManager.__focused__.clear();
    ModalManager.__anchor__?.remove();
    ModalManager.__anchor__ = null;
    ModalManager.destroyStyleSheet();
    bootstrap?.notify(null);
    const next = ModalManager.__bootstraps__.entries().next().value;
    if (next) {
      ModalManager.attach(next[0], next[1].root, next[1].notify);
      return;
    }
    const generation = ModalManager.__generation__;
    queueMicrotask(() => {
      if (generation !== ModalManager.__generation__) return;
      for (const node of [...ModalManager.__nodes__.values()])
        if (node.alive) node.onDestroy();
    });
  }
  /**
   * Registers the library-owned focus boundary and reevaluates committed UI.
   * @param id - Registered modal identity supplied by its foreground presenter.
   * @param element - Mounted outer wrapper, or null to release its reference.
   */
  static setFrameElement(id: number, element: HTMLElement | null): void {
    if (element) ModalManager.__frames__.set(id, element);
    else ModalManager.__frames__.delete(id);
    ModalManager.updateAccessibility(true);
  }
  /** Reads pending visible nodes in descending visual order. */
  private static visibleNodes(): ModalNode[] {
    return [...ModalManager.__nodes__.values()]
      .filter((node) => node.alive && node.visible && !node.settled)
      .sort((left, right) => right.order - left.order);
  }
  /**
   * Focuses a frame's first control, preserving an existing internal focus target.
   * @param id - Pending dimmed modal whose wrapper may already be registered.
   */
  private static focusFrame(id: number): void {
    const frame = ModalManager.__frames__.get(id);
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
        ModalManager.__frames__.get(node.id)?.contains(document.activeElement),
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
   * @param moveFocus - True only after frame DOM commits or anchor attachment,
   * so route reappearance does not focus controls with stale hidden styles.
   */
  private static updateAccessibility(moveFocus = false): void {
    if (typeof document === 'undefined') return;
    const root = ModalManager.__anchor__?.isConnected
      ? ModalManager.__anchor__.parentElement
      : null;
    const nodes = root
      ? ModalManager.visibleNodes().filter((node) => node.dimmed)
      : [];
    for (const id of ModalManager.__focused__)
      if (!nodes.some((node) => node.id === id))
        ModalManager.__focused__.delete(id);
    ModalManager.updateInert(nodes.length > 0 ? root : null);
    ModalManager.updateScrollLock(nodes.some((node) => node.lockScroll));
    if (!moveFocus) return;
    for (const node of nodes)
      if (
        !ModalManager.__focused__.has(node.id) &&
        ModalManager.__frames__.get(node.id)?.isConnected
      ) {
        ModalManager.__focused__.add(node.id);
        ModalManager.focusFrame(node.id);
        break;
      }
  }
  /**
   * Snapshots ancestor-path siblings once, leaving later portal nodes interactive.
   * @param root - Attached anchor parent, or null to release owned attributes.
   */
  private static updateInert(root: HTMLElement | null): void {
    if (ModalManager.__inertRoot__ === root) return;
    for (const element of ModalManager.__inertElements__)
      element.removeAttribute('inert');
    ModalManager.__inertElements__ = [];
    ModalManager.__inertRoot__ = root;
    if (!root) return;
    let branch = ModalManager.__anchor__;
    while (branch && branch !== document.body) {
      const parent = branch.parentElement;
      if (!parent) break;
      for (const sibling of parent.children)
        if (sibling !== branch && !sibling.hasAttribute('inert')) {
          sibling.setAttribute('inert', '');
          ModalManager.__inertElements__.push(sibling);
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
    const previous = ModalManager.__scrollStyle__;
    if (locked && !previous) {
      ModalManager.__scrollStyle__ = {
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
      ModalManager.__scrollStyle__ = undefined;
    }
  }
  /** Reverts page mutations before detach, root changes, or test reset. */
  private static releasePageEffects(): void {
    ModalManager.updateInert(null);
    if (typeof document !== 'undefined') ModalManager.updateScrollLock(false);
  }
  /** Installs exactly one bubbling document listener so controls may prevent defaults. */
  private static installKeyboardListener(): void {
    if (ModalManager.__keydown__) return;
    ModalManager.__keydown__ = (event) => {
      if (
        !ModalManager.__anchor__?.isConnected ||
        event.defaultPrevented ||
        event.isComposing ||
        event.keyCode === 229
      )
        return;
      const nodes = ModalManager.visibleNodes();
      if (event.key === 'Escape') {
        if (nodes[0]?.closeOnEscape) {
          event.preventDefault();
          closeModal(nodes[0]);
        }
      } else if (event.key === 'Tab') {
        const top = nodes.find((node) => node.dimmed);
        if (top?.trapFocus) ModalManager.trapTab(event, top.id);
      }
    };
    document.addEventListener('keydown', ModalManager.__keydown__);
  }
  /**
   * Cycles the top frame's keyboard boundary; native navigation handles middle items.
   * @param event - Unprevented non-composing Tab event from the shared listener.
   * @param id - Top participating modal with focus trapping enabled.
   */
  private static trapTab(event: KeyboardEvent, id: number): void {
    const frame = ModalManager.__frames__.get(id);
    if (!frame?.isConnected) return;
    const controls = getTabbableElements(frame);
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
    if (!ModalManager.__keydown__) return;
    document.removeEventListener('keydown', ModalManager.__keydown__);
    ModalManager.__keydown__ = undefined;
  }
  /** Provides a read-only copy of requests waiting for initialization. */
  static get prerender(): Modal[] {
    return map(ModalManager.__prerenderList__, (entry) => entry.modal);
  }
  /** Installs a handler and delivers queued requests with their original Promise channels. */
  static set openHandler(handler: Fn<[Modal], ModalNode>) {
    ModalManager.__openHandler__ = handler;
    ModalManager.flushPrerender();
  }
  /** Restores queueing only if the effect being cleaned up still owns the handler. */
  static releaseOpenHandler(handler: Fn<[Modal], ModalNode>): void {
    if (ModalManager.__openHandler__ === handler)
      ModalManager.__openHandler__ = ModalManager.__defaultOpenHandler__;
  }
  /** Flushes independent queue items, forwarding errors rather than swallowing them. */
  private static flushPrerender(): void {
    if (
      ModalManager.__openHandler__ === ModalManager.__defaultOpenHandler__ ||
      !ModalManager.__anchor__?.parentElement
    )
      return;
    const entries = ModalManager.__prerenderList__;
    ModalManager.__prerenderList__ = [];
    for (const entry of entries)
      try {
        if (entry.dispatch) entry.dispatch();
        else ModalManager.__openHandler__(entry.modal);
      } catch (error) {
        entry.modal.handleReject?.(error);
      }
  }
  /** Adds a live-node dispatcher to an already queued request. */
  static bindPrerender(modal: Modal, dispatch: Fn): void {
    const entry = ModalManager.__prerenderList__.find(
      (entry) => entry.modal === modal,
    );
    if (entry) entry.dispatch = dispatch;
  }
  /** Removes a pre-mount request after cancellation. */
  static cancelPrerender(modal: Modal): boolean {
    const index = ModalManager.__prerenderList__.findIndex(
      (entry) => entry.modal === modal,
    );
    if (index < 0) return false;
    ModalManager.__prerenderList__.splice(index, 1);
    return true;
  }
  /** Records compressed CSS without reading the DOM. */
  static defineStyleSheet(styleId: string, css: string): void {
    ModalManager.__styleSheetDefinition__.set(styleId, compressCss(css));
  }
  /** Creates a style manager only at browser initialization. */
  static applyStyleSheet(): void {
    ModalManager.__styleManager__ ??= styleManagerFactory(
      ModalManager.__scope__,
    );
    for (const [styleId, css] of ModalManager.__styleSheetDefinition__)
      ModalManager.__styleManager__(styleId, css, true);
  }
  /** Discards the captured scope manager so a later attach can rebuild styles. */
  private static destroyStyleSheet(): void {
    if (!ModalManager.__styleManager__) return;
    destroyScope(ModalManager.__scope__);
    ModalManager.__styleManager__ = undefined;
  }
  /** Computes class names in browser and server environments alike. */
  static getHashedClassNames(styleId: string): string {
    return `${styleId}-${ModalManager.__hash__}`;
  }
  /** Fully resets test state, unlike an individual provider's detach. */
  static reset(): void {
    ModalManager.__generation__++;
    ModalManager.removeKeyboardListener();
    ModalManager.releasePageEffects();
    for (const [id, target] of [...ModalManager.__focusTargets__].reverse())
      if (ModalManager.node(id)?.dimmed) ModalManager.restoreFocus(id, target);
    ModalManager.__focusTargets__.clear();
    ModalManager.__frames__.clear();
    ModalManager.__focused__.clear();
    ModalManager.__anchor__?.remove();
    ModalManager.__anchor__ = null;
    ModalManager.destroyStyleSheet();
    ModalManager.__prerenderList__ = [];
    ModalManager.__openHandler__ = ModalManager.__defaultOpenHandler__;
    for (const cleanup of ModalManager.__nodeCleanups__.values()) cleanup();
    ModalManager.__nodeCleanups__.clear();
    ModalManager.__nodes__.clear();
    ModalManager.__ids__ = [];
    ModalManager.__id__ =
      ModalManager.__order__ =
      ModalManager.__registrationVersion__ =
        0;
    ModalManager.__owner__ = null;
    for (const bootstrap of ModalManager.__bootstraps__.values())
      bootstrap.notify(null);
    ModalManager.__bootstraps__.clear();
    ModalManager.__warned__ = new WeakSet();
    ModalManager.notify();
    ModalManager.__listeners__.clear();
  }
  /** Opens through the current handler or queues until one is installed. */
  static open(modal: Modal): ModalNode | undefined {
    return ModalManager.__anchor__?.parentElement
      ? ModalManager.__openHandler__(modal)
      : ModalManager.__defaultOpenHandler__(modal);
  }
}
