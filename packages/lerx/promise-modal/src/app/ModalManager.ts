import { MutableRefObject } from 'react';

import { getRandomNumber } from '@winglet/common-utils';

import type { Fn } from '@aileron/types';

import type { Modal } from '@/promise-modal/types';

const prerenderListRef: MutableRefObject<Modal[]> = {
  current: [],
};

const openModalRef: MutableRefObject<Fn<[Modal], void>> = {
  current: (modal: Modal) => {
    prerenderListRef.current.push(modal);
  },
};

const anchorRef: MutableRefObject<HTMLElement | null> = {
  current: null,
};

export const ModalManager = {
  get prerender() {
    return prerenderListRef.current;
  },
  clearPrerender() {
    prerenderListRef.current = [];
  },
  open(modal: Modal) {
    openModalRef.current(modal);
  },
  setupOpen(open: (modal: Modal) => void) {
    openModalRef.current = open;
  },
  anchor(name: string, label = 'modal-anchor'): HTMLElement {
    if (anchorRef.current) {
      const anchor = document.getElementById(anchorRef.current.id);
      if (anchor) return anchor;
    }
    const node = document.createElement(name);
    node.setAttribute('id', `${label}-${getRandomNumber()}`);
    document.body.appendChild(node);
    anchorRef.current = node;
    return node;
  },
};
