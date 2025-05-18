import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { ModalBackground } from './background';
import type { ModalFrameProps } from './modal';

export interface BaseModal<T, B> {
  title?: ReactNode;
  subtitle?: ReactNode;
  background?: ModalBackground<B>;
  dimmed?: boolean;
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

export interface ContentComponentProps<Context extends Dictionary = object> {
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
  context: Context;
}

export type WrapperComponentProps<Context extends Dictionary = object> =
  PropsWithChildren<{
    context: Context;
  }>;

export interface FooterOptions {
  confirm?: ReactNode;
  hideConfirm?: boolean;
  cancel?: ReactNode;
  hideCancel?: boolean;
}

export type FooterComponentProps<Context extends Dictionary = object> = {
  confirmLabel?: ReactNode;
  hideConfirm?: boolean;
  cancelLabel?: ReactNode;
  hideCancel?: boolean;
  disabled?: boolean;
  onConfirm: VoidFunction;
  onCancel?: VoidFunction;
  context: Context;
};
