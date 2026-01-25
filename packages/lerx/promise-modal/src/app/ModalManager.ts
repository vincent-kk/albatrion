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

  private static __prerenderList__: Modal[] = [];

  static get prerender() {
    return ModalManager.__prerenderList__;
  }

  private static __openHandler__: Fn<[Modal], ModalNode> = ((modal: Modal) => {
    ModalManager.__prerenderList__.push(modal);
  }) as Fn<[Modal], ModalNode>;

  static set openHandler(handler: Fn<[Modal], ModalNode>) {
    ModalManager.__openHandler__ = handler;
    ModalManager.__prerenderList__ = [];
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
    ModalManager.__openHandler__ = ((modal: Modal) => {
      ModalManager.__prerenderList__.push(modal);
    }) as Fn<[Modal], ModalNode>;
    ModalManager.__refreshHandler__ = undefined;
    destroyScope(ModalManager.__scope__);
  }

  static open(modal: Modal): ModalNode {
    return ModalManager.__openHandler__(modal);
  }
}
