import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { ModalBackground } from './background';
import type { ModalFrameProps } from './modal';
import type { ModalOptions } from './option';

export interface BaseModal<T, B> {
  group?: string;
  /** Presentation variant shared by all modal kinds. */
  subtype?: 'info' | 'success' | 'warning' | 'error';
  title?: ReactNode;
  subtitle?: ReactNode;
  background?: ModalBackground<B>;
  dimmed?: boolean;
  duration?: ModalOptions['duration'];
  manualDestroy?: boolean;
  closeOnBackdropClick?: boolean;
  /**
   * Escape override; otherwise inherits the same-level backdrop click setting.
   * Escape closes the first accepting visible pending modal from the top.
   * Non-accepting nondimmed modals are skipped; non-accepting dimmed modals shield those below.
   */
  closeOnEscape?: boolean;
  /** Traps Tab only when the top visible pending modal is dimmed; defaults to true. */
  trapFocus?: boolean;
  /** Locks body scrolling while a pending dimmed modal is visible; defaults to true. */
  lockScroll?: boolean;
  /**
   * @internal Promise settlement channel injected by the handle layer
   * (dispatchModal). Travels with the modal data so prerendered modals keep
   * their wiring; not part of the public props surface.
   */
  handleResolve?: Fn<[result: T | undefined | null]>;
  /** @internal Rejects a request that cannot be rendered. */
  handleReject?: Fn<[error: unknown]>;
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
