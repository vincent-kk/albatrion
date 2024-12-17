import type { ReactNode } from 'react';

import type { ModalBackground } from './background';

export interface BaseModal<T, B> {
  title?: ReactNode;
  subtitle?: ReactNode;
  background?: ModalBackground<B>;
  manualDestroy: boolean;
  closeOnBackdropClick: boolean;
  resolve: (result: T | null) => void;
}

export interface ContentComponentProps {
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
}

export interface FooterOptions {
  confirm?: string;
  hideConfirm?: boolean;
  cancel?: string;
  hideCancel?: boolean;
}

export type FooterComponentProps = {
  confirmLabel?: string;
  hideConfirm?: boolean;
  cancelLabel?: string;
  hideCancel?: boolean;
  disabled?: boolean;
  onConfirm: VoidFunction;
  onCancel?: VoidFunction;
};
