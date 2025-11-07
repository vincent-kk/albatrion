import type { ComponentType, ReactNode } from 'react';

import type { Fn } from '@aileron/declare';

import type {
  AlertContentProps,
  AlertFooterRender,
  BackgroundComponent,
  ConfirmContentProps,
  ConfirmFooterRender,
  FooterOptions,
  ForegroundComponent,
  ModalBackground,
  PromptContentProps,
  PromptFooterRender,
  PromptInputProps,
} from '@/promise-modal/types';

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
