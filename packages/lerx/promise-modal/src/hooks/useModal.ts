import { useRef } from 'react';

import { useOnUnmount } from '@winglet/react-utils/hook';

import { ModalManager } from '@/promise-modal/app';
import {
  type AlertProps,
  type ConfirmProps,
  type ModalNode,
  type OverridableHandleProps,
  type PromptProps,
  alertHandler,
  confirmHandler,
  promptHandler,
} from '@/promise-modal/core';
import { closeModal } from '@/promise-modal/helpers/closeModal';

export const useModal = (configuration?: OverridableHandleProps) => {
  // Handler results expose modalNode as a live getter, so modals queued
  // before the provider mounted are still reachable at cleanup time.
  const modalResultsRef = useRef<
    Array<{
      readonly modalNode: ModalNode | undefined;
      readonly cancel: () => void;
    }>
  >([]);
  const baseArgsRef = useRef(configuration);

  const alertRef = useRef(<Background = any>(args: AlertProps<Background>) => {
    const result = alertHandler<Background>(
      baseArgsRef.current ? { ...baseArgsRef.current, ...args } : args,
    );
    modalResultsRef.current.push(result);
    return result.promiseHandler;
  });

  const confirmRef = useRef(
    <Background = any>(args: ConfirmProps<Background>) => {
      const result = confirmHandler<Background>(
        baseArgsRef.current ? { ...baseArgsRef.current, ...args } : args,
      );
      modalResultsRef.current.push(result);
      return result.promiseHandler;
    },
  );

  const promptRef = useRef(
    <Value, Background = any>(args: PromptProps<Value, Background>) => {
      const result = promptHandler<Value, Background>(
        baseArgsRef.current ? { ...baseArgsRef.current, ...args } : args,
      );
      modalResultsRef.current.push(result);
      return result.promiseHandler;
    },
  );

  useOnUnmount(() => {
    for (const result of modalResultsRef.current) {
      const modalNode = result.modalNode;
      if (modalNode) closeModal(modalNode, false);
      // Still queued before the provider mounted: cancel the prerender entry so
      // it does not orphan a queued modal and a forever-pending promise.
      else result.cancel();
    }
    ModalManager.refresh();
    modalResultsRef.current = [];
  });

  return {
    alert: alertRef.current,
    confirm: confirmRef.current,
    prompt: promptRef.current,
  } as const;
};
