import { ModalManager } from '@/promise-modal/app/ModalManager';
import type { AlertNode } from '@/promise-modal/core';
import { closeModal } from '@/promise-modal/helpers/closeModal';
import { subscribeAbortSignal } from '@/promise-modal/helpers/subscribeAbortSignal';

import type { AlertProps } from './type';

/**
 * Creates and manages an Alert modal.
 *
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 * @param args - Alert modal configuration options
 * @returns Object containing modalNode and promiseHandler
 *
 * @remarks
 * - modalNode: The created modal node instance
 * - promiseHandler: Promise that resolves when the modal is closed
 *
 * @example
 * ```tsx
 * const { modalNode, promiseHandler } = alertHandler({
 *   title: 'Success',
 *   content: 'Operation completed successfully!',
 * });
 *
 * await promiseHandler; // Wait until modal is closed
 * ```
 */
export const alertHandler = <BackgroundValue = any>(
  args: AlertProps<BackgroundValue>,
) => {
  const modalNode = ModalManager.open({
    ...args,
    type: 'alert',
  }) as AlertNode<BackgroundValue>;
  const unsubscribe = subscribeAbortSignal(modalNode, args.signal);
  const promiseHandler = new Promise<void>((resolve, reject) => {
    try {
      modalNode.handleResolve = () => {
        unsubscribe?.();
        resolve();
      };
      if (args.signal?.aborted) closeModal(modalNode);
    } catch (error) {
      closeModal(modalNode);
      unsubscribe?.();
      reject(error);
    }
  });
  return { modalNode, promiseHandler } as const;
};
