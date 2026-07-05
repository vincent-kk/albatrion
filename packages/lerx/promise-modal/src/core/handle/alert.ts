import type { AlertNode } from '@/promise-modal/core';

import { dispatchModal } from './dispatchModal';
import type { AlertProps } from './type';

/**
 * Creates and manages an Alert modal.
 *
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 * @param args - Alert modal configuration options
 * @returns Object containing modalNode and promiseHandler
 *
 * @remarks
 * - modalNode: live getter for the modal node; undefined while the modal is
 *   queued before the ModalProvider mounts, then set once the queue flushes
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
) =>
  dispatchModal<AlertNode<BackgroundValue>, void>(
    { ...args, type: 'alert' },
    {
      signal: args.signal,
      mapResult: () => undefined,
      cancelResult: () => null,
    },
  );
