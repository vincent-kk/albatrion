import type { Dictionary, Fn } from '@aileron/declare';

import type { ModalNode } from '@/promise-modal/core';

import type { AlertModal } from './alert';
import type { ModalBackground } from './background';
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

export type ModalFrameProps<Context extends Dictionary = object, B = any> = {
  id: number;
  type: 'alert' | 'confirm' | 'prompt';
  alive: boolean;
  visible: boolean;
  initiator: string;
  manualDestroy: boolean;
  closeOnBackdropClick: boolean;
  background?: ModalBackground<B>;
  onConfirm: Fn;
  onClose: Fn;
  onChange: Fn<[value: any]>;
  onDestroy: Fn;
  onChangeOrder: Fn;
  context: Context;
};

interface ModalIdProps {
  modalId: ModalNode['id'];
}

export interface PresenterProps extends ModalIdProps {
  getValue: Fn<[], number>;
  increment: Fn<[], number>;
  reset: Fn<[], number>;
}

export interface ModalLayerProps extends ModalIdProps {
  onChangeOrder: Fn;
}

export interface ModalHandlersWithId {
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
