import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

import type { ModalBackground } from './background';
import type { ModalFrameProps } from './modal';

export interface BaseModal<T, B> {
  title?: ReactNode;
  subtitle?: ReactNode;
  background?: ModalBackground<B>;
  manualDestroy?: boolean;
  closeOnBackdropClick?: boolean;
  resolve: (result: T | null) => void;
  ForegroundComponent?: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
}

export type ForegroundComponent = ComponentType<
  PropsWithChildren<ModalFrameProps>
>;
export type BackgroundComponent = ComponentType<ModalFrameProps>;

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
