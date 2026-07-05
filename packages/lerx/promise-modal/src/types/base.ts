import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { ModalBackground } from './background';
import type { ModalFrameProps } from './modal';

export interface BaseModal<T, B> {
  group?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  background?: ModalBackground<B>;
  dimmed?: boolean;
  duration?: number;
  manualDestroy?: boolean;
  closeOnBackdropClick?: boolean;
  /**
   * @internal Promise settlement channel injected by the handle layer
   * (dispatchModal). Travels with the modal data so prerendered modals keep
   * their wiring; not part of the public props surface.
   */
  handleResolve?: Fn<[result: T | null]>;
  ForegroundComponent?: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
}

export type ForegroundComponent = ComponentType<
  PropsWithChildren<ModalFrameProps>
>;
export type BackgroundComponent = ComponentType<ModalFrameProps>;

export interface ContentComponentProps<Context extends Dictionary = object> {
  onConfirm: Fn;
  onCancel: Fn;
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
  onConfirm: Fn;
  onCancel?: Fn;
  context: Context;
};
