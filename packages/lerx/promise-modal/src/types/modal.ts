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
  onConfirm: () => void;
  onClose: () => void;
  onChange: (value: any) => void;
  onDestroy: () => void;
  onChangeOrder: Fn;
  context: Context;
};

export interface ModalIdProps {
  modalId: ModalNode['id'];
}

export interface ModalLayerProps extends ModalIdProps {
  onChangeOrder: Fn;
}

export interface ModalHandlersWithId {
  onConfirm: (modalId: ModalNode['id']) => void;
  onClose: (modalId: ModalNode['id']) => void;
  onChange: (modalId: ModalNode['id'], value: any) => void;
  onDestroy: (modalId: ModalNode['id']) => void;
}

export type ModalActions = {
  modal: ModalNode | undefined;
  onConfirm: () => void;
  onClose: () => void;
  onChange: (value: any) => void;
  onDestroy: () => void;
};
