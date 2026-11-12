import type { Dictionary, Fn } from '@aileron/declare';

import type { ModalNode } from '@/promise-modal/core';

import type { AlertModal } from './alert';
import type { ConfirmModal } from './confirm';
import type { PromptModal } from './prompt';

export type Modal<T = any, B = any, Context extends Dictionary = object> =
  | AlertModal<B, Context>
  | ConfirmModal<B, Context>
  | PromptModal<T, B, Context>;

export type ManagedEntity = {
  id: number;
  initiator: string;
};

export type ManagedModal<T = any, B = any> = ManagedEntity & Modal<T, B>;

interface ModalIdProps {
  modalId: ModalNode['id'];
}

/** Identifies one independently subscribed modal presenter. */
export type PresenterProps = ModalIdProps;

export interface ModalLayerProps extends ModalIdProps {
  onChangeOrder: Fn;
}

export interface ModalHandlersWithId {
  /** Rejects one failed presentation without affecting peers. */
  onReject: Fn<[modalId: number, error: unknown]>;
  /** Rejects all alive nodes after an anchor-level failure. */
  onRejectAll: Fn<[error: unknown]>;
  /** Raises a node through the store-owned stacking order. */
  onChangeOrder: Fn<[modalId: number]>;
  onConfirm: Fn<[modalId: ModalNode['id']]>;
  onClose: Fn<[modalId: ModalNode['id']]>;
  onChange: Fn<[modalId: ModalNode['id'], value: any]>;
  onDestroy: Fn<[modalId: ModalNode['id']]>;
}

export type ModalActions = {
  modal: ModalNode | undefined;
  onConfirm: Fn;
  onClose: Fn;
  onChange: Fn<[value: any]>;
  onDestroy: Fn;
};

/** Read-only metadata for application predicates, without mutation methods. */
export type ModalNodeView = Readonly<
  Pick<
    ModalNode,
    | 'id'
    | 'type'
    | 'group'
    | 'subtype'
    | 'initiator'
    | 'alive'
    | 'visible'
    | 'settled'
    | 'dimmed'
    | 'manualDestroy'
    | 'closeOnBackdropClick'
    | 'closeOnEscape'
    | 'duration'
  >
>;
