import { getRandomString } from '@winglet/common-utils';

import type { Fn } from '@aileron/types';

import type { Modal } from '@/promise-modal/types';

export class ModalManager {
  static #prerenderList: Modal[] = [];
  static get prerender() {
    return ModalManager.#prerenderList;
  }

  static #isInitialized = false;
  static get isInitialized() {
    return ModalManager.#isInitialized;
  }

  static #openHandler: Fn<[Modal], void> = (modal: Modal) =>
    ModalManager.#prerenderList.push(modal);
  static set openHandler(handler: Fn<[Modal], void>) {
    ModalManager.#openHandler = handler;
    ModalManager.#prerenderList = [];
    ModalManager.#isInitialized = true;
  }

  static #anchor: HTMLElement | null = null;
  static anchor(options?: {
    tag?: string;
    prefix?: string;
    root?: HTMLElement;
  }): HTMLElement {
    if (ModalManager.#anchor) {
      const anchor = document.getElementById(ModalManager.#anchor.id);
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
    ModalManager.#anchor = node;
    return node;
  }

  static open(modal: Modal) {
    ModalManager.#openHandler(modal);
  }
}
