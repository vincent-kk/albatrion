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
import type { OverridableHandleProps } from '@/promise-modal/core/handle/type';
import { closeModal } from '@/promise-modal/helpers/closeModal';

export const useModal = (configuration?: OverridableHandleProps) => {
  const modalNodesRef = useRef<Array<ModalNode>>([]);
  const baseArgsRef = useRef(configuration);

  const alertRef = useRef(<Background = any>(args: AlertProps<Background>) => {
    const { modalNode, promiseHandler } = alertHandler<Background>(
      baseArgsRef.current ? { ...baseArgsRef.current, ...args } : args,
    );
    modalNodesRef.current.push(modalNode);
    return promiseHandler;
  });

  const confirmRef = useRef(
    <Background = any>(args: ConfirmProps<Background>) => {
      const { modalNode, promiseHandler } = confirmHandler<Background>(
        baseArgsRef.current ? { ...baseArgsRef.current, ...args } : args,
      );
      modalNodesRef.current.push(modalNode);
      return promiseHandler;
    },
  );

  const promptRef = useRef(
    <Value, Background = any>(args: PromptProps<Value, Background>) => {
      const { modalNode, promiseHandler } = promptHandler<Value, Background>(
        baseArgsRef.current ? { ...baseArgsRef.current, ...args } : args,
      );
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
