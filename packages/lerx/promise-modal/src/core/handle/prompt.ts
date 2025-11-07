import type { ComponentType, ReactNode } from 'react';

import type { Fn } from '@aileron/declare';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import type { PromptNode } from '@/promise-modal/core';
import type {
  BackgroundComponent,
  FooterOptions,
  ForegroundComponent,
  ModalBackground,
  PromptContentProps,
  PromptFooterRender,
  PromptInputProps,
} from '@/promise-modal/types';

/**
 * Configuration options for Prompt modal.
 *
 * @typeParam InputValue - Type of the value collected from user input
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 */
export interface PromptProps<InputValue, BackgroundValue = any> {
  /** Modal group identifier for managing related modals */
  group?: string;
  /** Modal title */
  title?: ReactNode;
  /** Modal subtitle */
  subtitle?: ReactNode;
  /** Modal content. Can be a ReactNode or a component */
  content?: ReactNode | ComponentType<PromptContentProps>;
  /** Initial value for the input field */
  defaultValue?: InputValue;
  /** Input component that receives value, onChange, and other props */
  Input: Fn<[props: PromptInputProps<InputValue>], ReactNode>;
  /** Validation function. Returns true to disable the confirm button */
  disabled?: Fn<[value: InputValue], boolean>;
  /** If true, returns defaultValue instead of rejecting on cancel */
  returnOnCancel?: boolean;
  /** Background layer data and configuration */
  background?: ModalBackground<BackgroundValue>;
  /** Footer configuration. Can be a render function, options object, or false */
  footer?: PromptFooterRender<InputValue> | FooterOptions | false;
  /** Whether to dim the background */
  dimmed?: boolean;
  /** Modal animation duration in milliseconds */
  duration?: number;
  /** If true, keeps modal in DOM after closing (for animations) */
  manualDestroy?: boolean;
  /** Whether to close modal on backdrop click */
  closeOnBackdropClick?: boolean;
  /** Custom foreground component */
  ForegroundComponent?: ForegroundComponent;
  /** Custom background component */
  BackgroundComponent?: BackgroundComponent;
}

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
      reject(error);
    }
  });
  return { modalNode, promiseHandler } as const;
};
