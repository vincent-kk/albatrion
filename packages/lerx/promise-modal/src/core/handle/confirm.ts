import type { ComponentType, ReactNode } from 'react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import type { ConfirmNode } from '@/promise-modal/core';
import { closeModal } from '@/promise-modal/helpers/closeModal';
import type {
  BackgroundComponent,
  ConfirmContentProps,
  ConfirmFooterRender,
  FooterOptions,
  ForegroundComponent,
  ModalBackground,
} from '@/promise-modal/types';

/**
 * Configuration options for Confirm modal.
 *
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 */
export interface ConfirmProps<BackgroundValue> {
  /** Modal group identifier for managing related modals */
  group?: string;
  /** Confirmation subtype that affects UI styling */
  subtype?: 'info' | 'success' | 'warning' | 'error';
  /** Modal title */
  title?: ReactNode;
  /** Modal subtitle */
  subtitle?: ReactNode;
  /** Modal content. Can be a ReactNode or a component */
  content?: ReactNode | ComponentType<ConfirmContentProps>;
  /** Background layer data and configuration */
  background?: ModalBackground<BackgroundValue>;
  /** Footer configuration. Can be a render function, options object, or false */
  footer?: ConfirmFooterRender | FooterOptions | false;
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
  const promiseHandler = new Promise<boolean>((resolve, reject) => {
    try {
      modalNode.handleResolve = (result) => resolve(result ?? false);
    } catch (error) {
      closeModal(modalNode);
      reject(error);
    }
  });
  return { modalNode, promiseHandler } as const;
};
