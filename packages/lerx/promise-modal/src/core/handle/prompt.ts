import type { ComponentType, ReactNode } from 'react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import type {
  BackgroundComponent,
  FooterOptions,
  ForegroundComponent,
  ModalBackground,
  PromptContentProps,
  PromptFooterRender,
  PromptInputProps,
} from '@/promise-modal/types';

interface PromptProps<InputValue, BackgroundValue = any> {
  group?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  content?: ReactNode | ComponentType<PromptContentProps>;
  defaultValue?: InputValue;
  Input: (props: PromptInputProps<InputValue>) => ReactNode;
  disabled?: (value: InputValue) => boolean;
  returnOnCancel?: boolean;
  background?: ModalBackground<BackgroundValue>;
  footer?: PromptFooterRender<InputValue> | FooterOptions | false;
  dimmed?: boolean;
  manualDestroy?: boolean;
  closeOnBackdropClick?: boolean;
  ForegroundComponent?: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
}

/**
 * Displays a promise-based prompt modal that collects user input.
 *
 * Creates a modal dialog with a custom input component and confirmation/cancel buttons.
 * The promise resolves with the input value when confirmed, or rejects when cancelled
 * (unless `returnOnCancel` is true).
 *
 * @typeParam InputValue - Type of the value collected from user input
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 * @param props - Prompt dialog configuration options
 * @returns Promise that resolves with the user's input value
 * @throws Rejects when cancelled (unless returnOnCancel is true)
 *
 * @example
 * Basic text input:
 * ```tsx
 * const name = await prompt<string>({
 *   title: 'Enter Your Name',
 *   content: 'Please enter your full name for the certificate.',
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
 *   content: 'Must be between 18 and 100',
 *   Input: ({ value, onChange }) => (
 *     <input
 *       type="number"
 *       min="18"
 *       max="100"
 *       value={value || ''}
 *       onChange={(e) => onChange(parseInt(e.target.value))}
 *     />
 *   ),
 *   disabled: (value) => !value || value < 18 || value > 100,
 *   defaultValue: 25,
 * });
 * ```
 *
 * @example
 * Select dropdown:
 * ```tsx
 * interface Theme {
 *   id: string;
 *   name: string;
 *   primary: string;
 * }
 *
 * const theme = await prompt<Theme>({
 *   title: 'Choose Theme',
 *   Input: ({ value, onChange }) => (
 *     <select
 *       value={value?.id || ''}
 *       onChange={(e) => {
 *         const selected = themes.find(t => t.id === e.target.value);
 *         onChange(selected);
 *       }}
 *     >
 *       <option value="">Select a theme...</option>
 *       {themes.map(theme => (
 *         <option key={theme.id} value={theme.id}>
 *           {theme.name}
 *         </option>
 *       ))}
 *     </select>
 *   ),
 *   disabled: (value) => !value,
 * });
 * ```
 *
 * @example
 * Multi-field form:
 * ```tsx
 * interface UserData {
 *   username: string;
 *   email: string;
 *   subscribe: boolean;
 * }
 *
 * const userData = await prompt<UserData>({
 *   title: 'Create Account',
 *   Input: ({ value, onChange }) => {
 *     const data = value || { username: '', email: '', subscribe: false };
 *
 *     return (
 *       <div className="form">
 *         <input
 *           placeholder="Username"
 *           value={data.username}
 *           onChange={(e) => onChange({ ...data, username: e.target.value })}
 *         />
 *         <input
 *           type="email"
 *           placeholder="Email"
 *           value={data.email}
 *           onChange={(e) => onChange({ ...data, email: e.target.value })}
 *         />
 *         <label>
 *           <input
 *             type="checkbox"
 *             checked={data.subscribe}
 *             onChange={(e) => onChange({ ...data, subscribe: e.target.checked })}
 *           />
 *           Subscribe to newsletter
 *         </label>
 *       </div>
 *     );
 *   },
 *   disabled: (value) => !value?.username || !value?.email,
 * });
 * ```
 *
 * @example
 * File upload:
 * ```tsx
 * const file = await prompt<File>({
 *   title: 'Upload Avatar',
 *   content: 'Select an image file (max 5MB)',
 *   Input: ({ value, onChange }) => (
 *     <div>
 *       <input
 *         type="file"
 *         accept="image/*"
 *         onChange={(e) => {
 *           const file = e.target.files?.[0];
 *           if (file && file.size <= 5 * 1024 * 1024) {
 *             onChange(file);
 *           }
 *         }}
 *       />
 *       {value && (
 *         <div>
 *           <img src={URL.createObjectURL(value)} alt="Preview" />
 *           <p>{value.name} ({(value.size / 1024).toFixed(1)} KB)</p>
 *         </div>
 *       )}
 *     </div>
 *   ),
 *   disabled: (value) => !value,
 * });
 * ```
 *
 * @example
 * With error handling:
 * ```tsx
 * try {
 *   const email = await prompt<string>({
 *     title: 'Reset Password',
 *     content: 'Enter your email to receive a reset link',
 *     Input: ({ value, onChange, context }) => (
 *       <EmailInput
 *         value={value}
 *         onChange={onChange}
 *         error={context.error}
 *       />
 *     ),
 *   });
 *
 *   await sendResetEmail(email);
 * } catch (error) {
 *   // User cancelled the prompt
 *   console.log('Password reset cancelled');
 * }
 * ```
 *
 * @example
 * Custom footer with validation:
 * ```tsx
 * const password = await prompt<string>({
 *   title: 'Set New Password',
 *   Input: ({ value, onChange }) => (
 *     <PasswordInput value={value} onChange={onChange} />
 *   ),
 *   footer: ({ value, onChange, onConfirm, onCancel, disabled }) => (
 *     <div>
 *       <PasswordStrength password={value} />
 *       <div className="buttons">
 *         <button onClick={onCancel}>Cancel</button>
 *         <button
 *           onClick={onConfirm}
 *           disabled={disabled}
 *           className={disabled ? 'disabled' : 'primary'}
 *         >
 *           Set Password
 *         </button>
 *       </div>
 *     </div>
 *   ),
 *   disabled: (value) => !value || value.length < 8,
 * });
 * ```
 *
 * @remarks
 * - The Input component receives value, onChange, onConfirm, onCancel, and context props
 * - Use the `disabled` function to control when the confirm button is enabled
 * - Set `returnOnCancel: true` to return defaultValue instead of rejecting on cancel
 * - The promise rejects when cancelled (unless returnOnCancel is set)
 * - Use onConfirm prop in Input to handle Enter key submission
 */
export const prompt = <InputValue, BackgroundValue = any>({
  group,
  title,
  subtitle,
  content,
  defaultValue,
  Input,
  disabled,
  returnOnCancel,
  background,
  footer,
  dimmed,
  manualDestroy,
  closeOnBackdropClick,
  ForegroundComponent,
  BackgroundComponent,
}: PromptProps<InputValue, BackgroundValue>) => {
  return new Promise<InputValue>((resolve, reject) => {
    try {
      ModalManager.open({
        type: 'prompt',
        group,
        resolve: (result) => resolve(result as InputValue),
        title,
        subtitle,
        content,
        Input,
        defaultValue,
        disabled,
        returnOnCancel,
        background,
        footer,
        dimmed,
        manualDestroy,
        closeOnBackdropClick,
        ForegroundComponent,
        BackgroundComponent,
      });
    } catch (error) {
      reject(error);
    }
  });
};
