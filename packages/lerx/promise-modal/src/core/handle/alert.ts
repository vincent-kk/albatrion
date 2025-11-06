import type { ComponentType, ReactNode } from 'react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import type {
  AlertContentProps,
  AlertFooterRender,
  BackgroundComponent,
  FooterOptions,
  ForegroundComponent,
  ModalBackground,
} from '@/promise-modal/types';

interface AlertProps<BackgroundValue> {
  group?: string;
  subtype?: 'info' | 'success' | 'warning' | 'error';
  title?: ReactNode;
  subtitle?: ReactNode;
  content?: ReactNode | ComponentType<AlertContentProps>;
  background?: ModalBackground<BackgroundValue>;
  footer?:
    | AlertFooterRender
    | Pick<FooterOptions, 'confirm' | 'hideConfirm'>
    | false;
  dimmed?: boolean;
  manualDestroy?: boolean;
  closeOnBackdropClick?: boolean;
  ForegroundComponent?: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
}

/**
 * Displays a promise-based alert modal that resolves when the user acknowledges.
 *
 * Creates a modal dialog with a single action button (typically "OK" or "Confirm").
 * The promise resolves when the user clicks the button or closes the modal.
 *
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 * @param props - Alert configuration options
 * @returns Promise that resolves when the alert is dismissed
 *
 * @example
 * Basic alert:
 * ```tsx
 * await alert({
 *   title: 'Success!',
 *   content: 'Your changes have been saved.',
 * });
 * console.log('Alert closed');
 * ```
 *
 * @example
 * Alert with subtype styling:
 * ```tsx
 * // Error alert
 * alert({
 *   subtype: 'error',
 *   title: 'Operation Failed',
 *   content: 'Unable to connect to server. Please try again later.',
 * });
 *
 * // Success alert
 * alert({
 *   subtype: 'success',
 *   title: 'Upload Complete',
 *   content: 'Your file has been successfully uploaded.',
 * });
 *
 * // Warning alert
 * alert({
 *   subtype: 'warning',
 *   title: 'Storage Almost Full',
 *   content: 'You have used 90% of your storage quota.',
 * });
 * ```
 *
 * @example
 * Custom content component:
 * ```tsx
 * const ErrorDetails = ({ onConfirm }) => (
 *   <div className="error-details">
 *     <p>Error Code: 500</p>
 *     <p>Time: {new Date().toLocaleString()}</p>
 *     <details>
 *       <summary>Stack Trace</summary>
 *       <pre>{error.stack}</pre>
 *     </details>
 *   </div>
 * );
 *
 * alert({
 *   title: 'Application Error',
 *   content: ErrorDetails,
 *   subtype: 'error',
 * });
 * ```
 *
 * @example
 * Custom footer:
 * ```tsx
 * alert({
 *   title: 'Terms Updated',
 *   content: 'Our terms of service have been updated.',
 *   footer: ({ onConfirm, context }) => (
 *     <div className="custom-footer">
 *       <a href="/terms" target="_blank">Read Terms</a>
 *       <button onClick={onConfirm}>I Understand</button>
 *     </div>
 *   ),
 * });
 * ```
 *
 * @example
 * Alert with background animation:
 * ```tsx
 * alert({
 *   title: 'Achievement Unlocked!',
 *   content: 'You completed your first task!',
 *   background: {
 *     data: { type: 'confetti', color: 'gold' },
 *   },
 *   BackgroundComponent: ({ background, visible }) => (
 *     <ConfettiAnimation
 *       active={visible}
 *       color={background.data.color}
 *     />
 *   ),
 * });
 * ```
 *
 * @example
 * Non-closeable critical alert:
 * ```tsx
 * alert({
 *   title: 'System Maintenance',
 *   content: 'The system will restart in 5 minutes. Please save your work.',
 *   closeOnBackdropClick: false,
 *   footer: {
 *     confirm: 'Got it',
 *   },
 *   manualDestroy: true,
 * });
 * ```
 *
 * @example
 * Chaining alerts:
 * ```tsx
 * async function showWelcomeTour() {
 *   await alert({
 *     title: 'Welcome!',
 *     content: 'Let\'s take a quick tour of the app.',
 *   });
 *
 *   await alert({
 *     title: 'Dashboard',
 *     content: 'This is where you\'ll see your daily summary.',
 *   });
 *
 *   await alert({
 *     title: 'Get Started',
 *     content: 'You\'re all set! Start exploring the app.',
 *     subtype: 'success',
 *   });
 * }
 * ```
 *
 * @remarks
 * - The promise always resolves (never rejects) unless an error occurs during modal creation
 * - Use `manualDestroy: true` to keep the modal in DOM after closing (for animations)
 * - Set `closeOnBackdropClick: false` to prevent closing by clicking outside
 * - The `group` prop can be used to manage multiple related modals
 */
export const alert = <BackgroundValue = any>(
  props: AlertProps<BackgroundValue>,
) => alertHandler(props).promiseHandler;

export const alertHandler = <BackgroundValue = any>(
  args: AlertProps<BackgroundValue>,
) => {
  const modalNode = ModalManager.open({ type: 'alert', ...args });
  const promiseHandler = new Promise<void>((resolve, reject) => {
    try {
      modalNode.handleResolve = () => resolve();
    } catch (error) {
      reject(error);
    }
  });
  return { modalNode, promiseHandler } as const;
};
