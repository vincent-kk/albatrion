import type { PropsWithChildren } from 'react';

import type { AlertModal } from './alert';
import type { ConfirmModal } from './confirm';
import type { PromptModal } from './prompt';

export type Modal<T = any, B = any> =
  | AlertModal<B>
  | ConfirmModal<B>
  | PromptModal<T, B>;

export type ManagedEntity = {
  id: number;
  alive: boolean;
  visible: boolean;
  initiator: string;
  subscribe: (listener: Fn) => Fn;
};

export type ManagedModal = ManagedEntity & Modal;

export type UniversalModalProps = {
  modal: ManagedModal;
  handlers: Omit<ModalHandlers, 'getModalData'>;
};

export type ModalFrameProps = PropsWithChildren<UniversalModalProps>;

export type ModalIdProps = {
  modalId: ManagedModal['id'];
};

export interface ModalHandlersWithId {
  onConfirm: (modalId: ManagedModal['id']) => void;
  onClose: (modalId: ManagedModal['id']) => void;
  onChange: (modalId: ManagedModal['id'], value: any) => void;
  onDestroy: (modalId: ManagedModal['id']) => void;
}

export type ModalHandlers = {
  onConfirm: () => void;
  onClose: () => void;
  onChange: (value: any) => void;
  onDestroy: () => void;
  getModalData: () => ManagedModal | undefined;
};
