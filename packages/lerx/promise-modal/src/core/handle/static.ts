import { type AlertProps, alertHandler } from './alert';
import { type ConfirmProps, confirmHandler } from './confirm';
import { type PromptProps, promptHandler } from './prompt';

/**
 * Displays a promise-based alert modal.
 *
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 * @param args - Alert modal configuration options
 * @returns Promise that resolves when the modal is closed
 *
 * @example
 * ```tsx
 * await alert({
 *   title: 'Success!',
 *   content: 'Your changes have been saved.',
 * });
 * ```
 *
 * @example
 * With subtype styling:
 * ```tsx
 * alert({
 *   subtype: 'error',
 *   title: 'Operation Failed',
 *   content: 'Unable to connect to server.',
 * });
 * ```
 */
export const alert = <BackgroundValue = any>(
  args: AlertProps<BackgroundValue>,
) => alertHandler(args).promiseHandler;

/**
 * Displays a promise-based confirmation modal with boolean result.
 *
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 * @param args - Confirmation modal configuration options
 * @returns Promise that resolves to true if confirmed, false if cancelled
 *
 * @example
 * ```tsx
 * const shouldDelete = await confirm({
 *   title: 'Delete Item?',
 *   content: 'This action cannot be undone.',
 * });
 *
 * if (shouldDelete) {
 *   await deleteItem();
 * }
 * ```
 *
 * @example
 * Destructive action warning:
 * ```tsx
 * const shouldProceed = await confirm({
 *   subtype: 'error',
 *   title: 'Delete Account',
 *   content: 'All data will be permanently lost.',
 *   footer: {
 *     confirm: 'Delete Account',
 *     cancel: 'Keep Account',
 *     confirmDanger: true,
 *   },
 * });
 * ```
 */
export const confirm = <BackgroundValue = any>(
  args: ConfirmProps<BackgroundValue>,
) => confirmHandler(args).promiseHandler;

/**
 * Displays a promise-based prompt modal to collect user input.
 *
 * @typeParam InputValue - Type of the value collected from user input
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 * @param args - Prompt modal configuration options
 * @returns Promise that resolves with user input value
 * @throws Rejects when cancelled (unless returnOnCancel is true)
 *
 * @example
 * ```tsx
 * const name = await prompt<string>({
 *   title: 'Enter Your Name',
 *   Input: ({ value, onChange, onConfirm }) => (
 *     <input
 *       type="text"
 *       value={value || ''}
 *       onChange={(e) => onChange(e.target.value)}
 *       onKeyPress={(e) => e.key === 'Enter' && onConfirm()}
 *       autoFocus
 *     />
 *   ),
 *   defaultValue: 'John Doe',
 * });
 * ```
 *
 * @example
 * Number input with validation:
 * ```tsx
 * const age = await prompt<number>({
 *   title: 'Enter Your Age',
 *   Input: ({ value, onChange }) => (
 *     <input
 *       type="number"
 *       value={value || ''}
 *       onChange={(e) => onChange(parseInt(e.target.value))}
 *     />
 *   ),
 *   disabled: (value) => !value || value < 18 || value > 100,
 * });
 * ```
 */
export const prompt = <InputValue, BackgroundValue = any>(
  args: PromptProps<InputValue, BackgroundValue>,
) => promptHandler(args).promiseHandler;
