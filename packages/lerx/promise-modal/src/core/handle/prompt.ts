import { ModalManager } from '@/promise-modal/app/ModalManager';
import type { PromptNode } from '@/promise-modal/core';
import { closeModal } from '@/promise-modal/helpers/closeModal';

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
 * - modalNode: The created modal node instance
 * - promiseHandler: Promise that resolves with user input value
 * - Input component receives value, onChange, onConfirm, onCancel, and context props
 * - Use disabled function to control confirm button's enabled state
 * - If returnOnCancel is false (default), promise rejects on cancel
 * - If returnOnCancel is true, returns defaultValue on cancel
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
 * try {
 *   const name = await promiseHandler;
 *   console.log('User entered:', name);
 * } catch {
 *   console.log('User cancelled');
 * }
 * ```
 */
export const promptHandler = <InputValue, BackgroundValue = any>(
  args: PromptProps<InputValue, BackgroundValue>,
) => {
  const modalNode = ModalManager.open({
    ...args,
    type: 'prompt',
  }) as PromptNode<InputValue, BackgroundValue>;
  const promiseHandler = new Promise<InputValue>((resolve, reject) => {
    try {
      modalNode.handleResolve = (result) => resolve(result as InputValue);
    } catch (error) {
      closeModal(modalNode);
      reject(error);
    }
  });
  return { modalNode, promiseHandler } as const;
};
