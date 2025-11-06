import { useRef } from 'react';

import { useOnUnmount } from '@winglet/react-utils/hook';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import {
  type ModalNode,
  alertHandler,
  confirmHandler,
  promptHandler,
} from '@/promise-modal/core';

export const useModal = () => {
  const modalNodesRef = useRef<Array<ModalNode>>([]);

  const alertRef = useRef((args: Parameters<typeof alertHandler>[0]) => {
    const { modalNode, promiseHandler } = alertHandler(args);
    modalNodesRef.current.push(modalNode);
    return promiseHandler;
  });

  const confirmRef = useRef((args: Parameters<typeof confirmHandler>[0]) => {
    const { modalNode, promiseHandler } = confirmHandler(args);
    modalNodesRef.current.push(modalNode);
    return promiseHandler;
  });

  const promptRef = useRef((args: Parameters<typeof promptHandler>[0]) => {
    const { modalNode, promiseHandler } = promptHandler(args);
    modalNodesRef.current.push(modalNode);
    return promiseHandler;
  });

  useOnUnmount(() => {
    for (const node of modalNodesRef.current) {
      node.onClose();
      node.onHide();
      if (node.manualDestroy === false)
        setTimeout(() => node.onDestroy(), node.duration);
    }
    ModalManager.refresh();
    modalNodesRef.current = [];
  });

  return {
    alert: alertRef.current,
    confirm: confirmRef.current,
    prompt: promptRef.current,
  } as const;
};
