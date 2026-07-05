import type { PromptNode } from '@/promise-modal/core';

import { dispatchModal } from './dispatchModal';
import type { PromptProps } from './type';

/**
 * Creates and manages a Prompt modal.
 *
 * @typeParam InputValue - Type of the value collected from user input
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 * @param args - Prompt modal configuration options
 * @returns Object containing modalNode and promiseHandler
 *
 * @remarks
 * - modalNode: live getter for the modal node; undefined while the modal is
 *   queued before the ModalProvider mounts, then set once the queue flushes
 * - promiseHandler: Promise that resolves with the user input value
 * - Input component receives value, onChange, onConfirm, onCancel, and context props
 * - Use disabled function to control confirm button's enabled state
 * - If returnOnCancel is false (default), the promise resolves with null on cancel
 * - If returnOnCancel is true, resolves with the input value at cancel time
 *   (initially defaultValue)
 *
 * @example
 * ```tsx
 * const { modalNode, promiseHandler } = promptHandler<string>({
 *   title: 'Enter Your Name',
 *   Input: ({ value, onChange, onConfirm }) => (
 *     <input
 *       type="text"
 *       value={value || ''}
 *       onChange={(e) => onChange(e.target.value)}
 *       onKeyPress={(e) => e.key === 'Enter' && onConfirm()}
 *     />
 *   ),
 *   defaultValue: '',
 * });
 *
 * const name = await promiseHandler;
 * if (name === null) console.log('User cancelled');
 * ```
 */
export const promptHandler = <InputValue, BackgroundValue = any>(
  args: PromptProps<InputValue, BackgroundValue>,
) =>
  dispatchModal<PromptNode<InputValue, BackgroundValue>, InputValue | null>(
    { ...args, type: 'prompt' },
    {
      signal: args.signal,
      mapResult: (result) => (result as InputValue | null) ?? null,
      cancelResult: () =>
        args.returnOnCancel ? (args.defaultValue ?? null) : null,
    },
  );
