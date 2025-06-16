import { getRandomString } from '@winglet/common-utils/lib';
import {
  compressCss,
  destroyScope,
  styleManagerFactory,
} from '@winglet/react-utils/style-manager';

import type { Fn } from '@aileron/declare';

import type { Modal } from '@/promise-modal/types';

export class ModalManager {
  static #active = false;
  static activate() {
    if (ModalManager.#active) return false;
    return (ModalManager.#active = true);
  }

  static #anchor: HTMLElement | null = null;
  static #scope: string = `promise-modal-${getRandomString(36)}`;
  static anchor(options?: {
    tag?: string;
    prefix?: string;
    root?: HTMLElement;
  }): HTMLElement {
    if (ModalManager.#anchor) return ModalManager.#anchor;
    const {
      tag = 'div',
      prefix = 'promise-modal',
      root = document.body,
    } = options || {};
    const node = document.createElement(tag);
    node.setAttribute('id', `${prefix}-${getRandomString(36)}`);
    node.setAttribute('data-scope', ModalManager.#scope);
    root.appendChild(node);
    ModalManager.#anchor = node;
    return node;
  }

  static #prerenderList: Modal[] = [];
  static get prerender() {
    return ModalManager.#prerenderList;
  }

  static #openHandler: Fn<[Modal], void> = (modal: Modal) =>
    ModalManager.#prerenderList.push(modal);
  static set openHandler(handler: Fn<[Modal], void>) {
    ModalManager.#openHandler = handler;
    ModalManager.#prerenderList = [];
  }

  static get unanchored() {
    return !ModalManager.#anchor;
  }

  static #styleManager = styleManagerFactory(ModalManager.#scope);
  static #styleSheetDefinition = new Map<string, string>();
  static defineStyleSheet(styleId: string, css: string) {
    ModalManager.#styleSheetDefinition.set(styleId, compressCss(css));
  }
  static applyStyleSheet() {
    for (const [styleId, css] of ModalManager.#styleSheetDefinition)
      ModalManager.#styleManager(styleId, css, true);
  }

  static reset() {
    ModalManager.#active = false;
    ModalManager.#anchor = null;
    ModalManager.#prerenderList = [];
    ModalManager.#openHandler = (modal: Modal) =>
      ModalManager.#prerenderList.push(modal);
    destroyScope(ModalManager.#scope);
  }

  static open(modal: Modal) {
    ModalManager.#openHandler(modal);
  }
}
