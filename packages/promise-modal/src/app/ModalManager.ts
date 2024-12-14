import { MutableRefObject } from 'react';

import { getRandomNumber } from '@lumy-pack/common';

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
  setup(open: (modal: Modal) => void) {
    openModalRef.current = open;
  },
  anchor(name: string, label = 'modal-anchor'): HTMLElement {
    if (anchorRef.current) return anchorRef.current;
    const node = document.createElement(name);
    node.setAttribute('id', `${label}-${getRandomNumber()}`);
    document.body.appendChild(node);
    anchorRef.current = node;
    return node;
  },
};
