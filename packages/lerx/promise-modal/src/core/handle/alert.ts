import type { ComponentType, ReactNode } from 'react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import type { AlertNode } from '@/promise-modal/core';
import type {
  AlertContentProps,
  AlertFooterRender,
  BackgroundComponent,
  FooterOptions,
  ForegroundComponent,
  ModalBackground,
} from '@/promise-modal/types';

/**
 * Configuration options for Alert modal.
 *
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 */
export interface AlertProps<BackgroundValue> {
  /** Modal group identifier for managing related modals */
  group?: string;
  /** Alert subtype that affects UI styling */
  subtype?: 'info' | 'success' | 'warning' | 'error';
  /** Modal title */
  title?: ReactNode;
  /** Modal subtitle */
  subtitle?: ReactNode;
  /** Modal content. Can be a ReactNode or a component */
  content?: ReactNode | ComponentType<AlertContentProps>;
  /** Background layer data and configuration */
  background?: ModalBackground<BackgroundValue>;
  /** Footer configuration. Can be a render function, options object, or false */
  footer?:
    | AlertFooterRender
    | Pick<FooterOptions, 'confirm' | 'hideConfirm'>
    | false;
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
  const promiseHandler = new Promise<void>((resolve, reject) => {
    try {
      modalNode.handleResolve = () => resolve();
    } catch (error) {
      reject(error);
    }
  });
  return { modalNode, promiseHandler } as const;
};
