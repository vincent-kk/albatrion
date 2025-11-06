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

export class ModalManager {
  static #anchor: HTMLElement | null = null;
  static #scope: string = `promise-modal-${getRandomString(36)}`;
  static #hash: string = polynomialHash(ModalManager.#scope);
  static #styleManager = styleManagerFactory(ModalManager.#scope);
  static #styleSheetDefinition = new Map<string, string>();

  static anchor(options?: {
    tag?: string;
    prefix?: string;
    root?: HTMLElement;
  }): HTMLElement {
    if (ModalManager.#anchor !== null) return ModalManager.#anchor;
    const {
      tag = 'div',
      prefix = 'promise-modal',
      root = document.body,
    } = options || {};
    const node = document.createElement(tag);
    node.id = `${prefix}-${getRandomString(36)}`;
    node.className = ModalManager.#scope;
    root.appendChild(node);
    ModalManager.#anchor = node;
    return node;
  }

  static get anchored() {
    return ModalManager.#anchor !== null;
  }

  static #prerenderList: Modal[] = [];

  static get prerender() {
    return ModalManager.#prerenderList;
  }

  static #openHandler: Fn<[Modal], ModalNode> = ((modal: Modal) => {
    ModalManager.#prerenderList.push(modal);
  }) as Fn<[Modal], ModalNode>;

  static set openHandler(handler: Fn<[Modal], ModalNode>) {
    ModalManager.#openHandler = handler;
    ModalManager.#prerenderList = [];
  }

  static defineStyleSheet(styleId: string, css: string) {
    ModalManager.#styleSheetDefinition.set(styleId, compressCss(css));
  }

  static applyStyleSheet() {
    for (const [styleId, css] of ModalManager.#styleSheetDefinition)
      ModalManager.#styleManager(styleId, css, true);
  }

  static getHashedClassNames(styleId: string) {
    return `${styleId}-${ModalManager.#hash}`;
  }

  static reset() {
    ModalManager.#anchor = null;
    ModalManager.#prerenderList = [];
    ModalManager.#openHandler = ((modal: Modal) => {
      ModalManager.#prerenderList.push(modal);
    }) as Fn<[Modal], ModalNode>;
    destroyScope(ModalManager.#scope);
  }

  static open(modal: Modal): ModalNode {
    return ModalManager.#openHandler(modal);
  }
}
