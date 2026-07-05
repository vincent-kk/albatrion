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
import type { Modal } from '@/promise-modal/types';

interface PrerenderEntry {
  modal: Modal;
  /** Re-dispatches the queued modal through the active openHandler on flush. */
  dispatch?: Fn;
}

export class ModalManager {
  private static __anchor__: HTMLElement | null = null;
  private static __scope__: string = `promise-modal-${getRandomString(36)}`;
  private static __hash__: string = polynomialHash(ModalManager.__scope__);
  private static __styleManager__ = styleManagerFactory(ModalManager.__scope__);
  private static __styleSheetDefinition__ = new Map<string, string>();

  static anchor(options?: {
    tag?: string;
    prefix?: string;
    root?: HTMLElement;
  }): HTMLElement {
    if (ModalManager.__anchor__ !== null) return ModalManager.__anchor__;
    const {
      tag = 'div',
      prefix = 'promise-modal',
      root = document.body,
    } = options || {};
    const node = document.createElement(tag);
    node.id = `${prefix}-${getRandomString(36)}`;
    node.className = ModalManager.__scope__;
    root.appendChild(node);
    ModalManager.__anchor__ = node;
    return node;
  }

  static get anchored() {
    return ModalManager.__anchor__ !== null;
  }

  private static __prerenderList__: PrerenderEntry[] = [];

  static get prerender(): Modal[] {
    return map(ModalManager.__prerenderList__, (entry) => entry.modal);
  }

  private static __defaultOpenHandler__: Fn<[Modal], ModalNode | undefined> = (
    modal,
  ) => {
    ModalManager.__prerenderList__.push({ modal });
    return undefined;
  };

  private static __openHandler__ = ModalManager.__defaultOpenHandler__;

  /**
   * Registers the React-side open handler, then flushes the prerender queue
   * through it so modals opened before mount keep their promise wiring alive.
   */
  static set openHandler(handler: Fn<[Modal], ModalNode>) {
    ModalManager.__openHandler__ = handler;
    const entries = ModalManager.__prerenderList__;
    ModalManager.__prerenderList__ = [];
    for (const entry of entries)
      if (entry.dispatch) entry.dispatch();
      else handler(entry.modal);
  }

  /** Attaches a flush-time dispatcher to a queued modal; no-op if not queued. */
  static bindPrerender(modal: Modal, dispatch: Fn) {
    const list = ModalManager.__prerenderList__;
    for (let index = 0; index < list.length; index++)
      if (list[index].modal === modal) {
        list[index].dispatch = dispatch;
        return;
      }
  }

  /** Removes a queued modal (pre-mount abort). Returns whether it was queued. */
  static cancelPrerender(modal: Modal): boolean {
    const list = ModalManager.__prerenderList__;
    for (let index = 0; index < list.length; index++)
      if (list[index].modal === modal) {
        list.splice(index, 1);
        return true;
      }
    return false;
  }

  private static __refreshHandler__?: Fn<[], void>;

  static set refreshHandler(handler: Fn<[], void>) {
    ModalManager.__refreshHandler__ = handler;
  }

  static refresh() {
    ModalManager.__refreshHandler__?.();
  }

  static defineStyleSheet(styleId: string, css: string) {
    ModalManager.__styleSheetDefinition__.set(styleId, compressCss(css));
  }

  static applyStyleSheet() {
    for (const [styleId, css] of ModalManager.__styleSheetDefinition__)
      ModalManager.__styleManager__(styleId, css, true);
  }

  static getHashedClassNames(styleId: string) {
    return `${styleId}-${ModalManager.__hash__}`;
  }

  static reset() {
    ModalManager.__anchor__ = null;
    ModalManager.__prerenderList__ = [];
    ModalManager.__openHandler__ = ModalManager.__defaultOpenHandler__;
    ModalManager.__refreshHandler__ = undefined;
    destroyScope(ModalManager.__scope__);
    // destroyScope invalidates the captured StyleManager instance; rebind so a
    // subsequent initialize can re-apply the registered style sheets.
    ModalManager.__styleManager__ = styleManagerFactory(ModalManager.__scope__);
  }

  static open(modal: Modal): ModalNode | undefined {
    return ModalManager.__openHandler__(modal);
  }
}
