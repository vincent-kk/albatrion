import type { ConfirmNode } from '@/promise-modal/core';

import { dispatchModal } from './dispatchModal';
import type { ConfirmProps } from './type';

/**
 * Creates and manages a Confirm modal.
 *
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 * @param args - Confirm modal configuration options
 * @returns Object containing modalNode and promiseHandler
 *
 * @remarks
 * - modalNode: The created modal node instance; undefined while the modal is
 *   queued before the ModalProvider mounts (the promise stays valid)
 * - promiseHandler: Promise that resolves to true if confirmed, false if cancelled
 * - Returns true only when explicitly confirmed via the confirm action
 * - Returns false for cancel action, backdrop click (if enabled), or abort
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
  const { modalNode, promiseHandler } = dispatchModal<
    ConfirmNode<BackgroundValue>,
    boolean
  >(
    { ...args, type: 'confirm' },
    {
      signal: args.signal,
      mapResult: (result) => (result as boolean | null) ?? false,
      cancelResult: () => null,
    },
  );
  return { modalNode, promiseHandler } as const;
};
