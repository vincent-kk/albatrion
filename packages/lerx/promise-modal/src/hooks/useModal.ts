import { useRef } from 'react';

import { useOnUnmount } from '@winglet/react-utils/hook';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import {
  type AlertProps,
  type ConfirmProps,
  type ModalNode,
  type PromptProps,
  alertHandler,
  confirmHandler,
  promptHandler,
} from '@/promise-modal/core';
import { closeModal } from '@/promise-modal/helpers/closeModal';

export const useModal = () => {
  const modalNodesRef = useRef<Array<ModalNode>>([]);

  const alertRef = useRef(
    <BackgroundValue = any>(args: AlertProps<BackgroundValue>) => {
      const { modalNode, promiseHandler } = alertHandler(args);
      modalNodesRef.current.push(modalNode);
      return promiseHandler;
    },
  );

  const confirmRef = useRef(
    <BackgroundValue = any>(args: ConfirmProps<BackgroundValue>) => {
      const { modalNode, promiseHandler } = confirmHandler(args);
      modalNodesRef.current.push(modalNode);
      return promiseHandler;
    },
  );

  const promptRef = useRef(
    <InputValue, BackgroundValue = any>(
      args: PromptProps<InputValue, BackgroundValue>,
    ) => {
      const { modalNode, promiseHandler } = promptHandler(args);
      modalNodesRef.current.push(modalNode);
      return promiseHandler;
    },
  );

  useOnUnmount(() => {
    for (const node of modalNodesRef.current) closeModal(node, false);
    ModalManager.refresh();
    modalNodesRef.current = [];
  });

  return {
    alert: alertRef.current,
    confirm: confirmRef.current,
    prompt: promptRef.current,
  } as const;
};
