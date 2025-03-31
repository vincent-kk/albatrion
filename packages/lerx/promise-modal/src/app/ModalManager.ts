import { getRandomString } from '@winglet/common-utils';

import type { Fn } from '@aileron/types';

import type { Modal } from '@/promise-modal/types';

export class ModalManager {
  static #anchor: HTMLElement | null = null;
  static #prerenderList: Modal[] = [];
  static #openHandler: Fn<[Modal], void> = (modal: Modal) =>
    ModalManager.#prerenderList.push(modal);
  static set openHandler(handler: Fn<[Modal], void>) {
    ModalManager.#openHandler = handler;
  }
  static get prerender() {
    return ModalManager.#prerenderList;
  }
  static clearPrerender() {
    ModalManager.#prerenderList = [];
  }
  static open(modal: Modal) {
    ModalManager.#openHandler(modal);
  }
  static anchor(options?: {
    tagName?: string;
    prefix?: string;
    root?: HTMLElement;
  }): HTMLElement {
    if (ModalManager.#anchor) {
      const anchor = document.getElementById(ModalManager.#anchor.id);
      if (anchor) return anchor;
    }
    const {
      tagName = 'div',
      prefix = 'promise-modal',
      root = document.body,
    } = options || {};
    const node = document.createElement(tagName);
    node.setAttribute('id', `${prefix}-${getRandomString(36)}`);
    root.appendChild(node);
    ModalManager.#anchor = node;
    return node;
  }
}
