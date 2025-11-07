import { ModalManager } from '@/promise-modal/app/ModalManager';
import type { ConfirmNode } from '@/promise-modal/core';
import { closeModal } from '@/promise-modal/helpers/closeModal';
import { subscribeAbortSignal } from '@/promise-modal/helpers/subscribeAbortSignal';

import type { ConfirmProps } from './type';

/**
 * Creates and manages a Confirm modal.
 *
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 * @param args - Confirm modal configuration options
 * @returns Object containing modalNode and promiseHandler
 *
 * @remarks
 * - modalNode: The created modal node instance
 * - promiseHandler: Promise that resolves to true if confirmed, false if cancelled
 * - Returns true only when explicitly confirmed via the confirm action
 * - Returns false for cancel action or backdrop click (if enabled)
 *
 * @example
 * ```tsx
 * const { modalNode, promiseHandler } = confirmHandler({
 *   title: 'Delete Item?',
 *   content: 'This action cannot be undone.',
 * });
 *
 * const confirmed = await promiseHandler;
 * if (confirmed) {
 *   await deleteItem();
 * }
 * ```
 */
export const confirmHandler = <BackgroundValue = any>(
  args: ConfirmProps<BackgroundValue>,
) => {
  const modalNode = ModalManager.open({
    ...args,
    type: 'confirm',
  }) as ConfirmNode<BackgroundValue>;
  const unsubscribe = subscribeAbortSignal(modalNode, args.signal);
  const promiseHandler = new Promise<boolean>((resolve, reject) => {
    try {
      modalNode.handleResolve = (result) => {
        unsubscribe?.();
        resolve(result ?? false);
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
