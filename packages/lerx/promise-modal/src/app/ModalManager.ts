import { getRandomString } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { Modal } from '@/promise-modal/types';

export class ModalManager {
  private static __active__ = false;
  static activate() {
    if (ModalManager.__active__) return false;
    return (ModalManager.__active__ = true);
  }

  private static __anchor__: HTMLElement | null = null;
  static anchor(options?: {
    tag?: string;
    prefix?: string;
    root?: HTMLElement;
  }): HTMLElement {
    if (ModalManager.__anchor__) {
      const anchor = document.getElementById(ModalManager.__anchor__.id);
      if (anchor) return anchor;
    }
    const {
      tag = 'div',
      prefix = 'promise-modal',
      root = document.body,
    } = options || {};
    const node = document.createElement(tag);
    node.setAttribute('id', `${prefix}-${getRandomString(36)}`);
    root.appendChild(node);
    ModalManager.__anchor__ = node;
    return node;
  }

  private static __prerenderList__: Modal[] = [];
  static get prerender() {
    return ModalManager.__prerenderList__;
  }

  private static __openHandler__: Fn<[Modal], void> = (modal: Modal) =>
    ModalManager.__prerenderList__.push(modal);
  static set openHandler(handler: Fn<[Modal], void>) {
    ModalManager.__openHandler__ = handler;
    ModalManager.__prerenderList__ = [];
  }

  static get unanchored() {
    return !ModalManager.__anchor__;
  }

  static reset() {
    ModalManager.__active__ = false;
    ModalManager.__anchor__ = null;
    ModalManager.__prerenderList__ = [];
    ModalManager.__openHandler__ = (modal: Modal) =>
      ModalManager.__prerenderList__.push(modal);
  }

  static open(modal: Modal) {
    ModalManager.__openHandler__(modal);
  }
}
