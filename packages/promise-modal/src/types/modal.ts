import type { ChangeEvent, PropsWithChildren } from 'react';

import type { AlertModal } from './alert';
import type { ConfirmModal } from './confirm';
import type { PromptModal } from './prompt';

export type Modal<T = any, B = any> =
  | AlertModal<B>
  | ConfirmModal<B>
  | PromptModal<T, B>;

export type ManagedEntity = {
  id: number;
  isValid: boolean;
  isVisible: boolean;
  initiator: string;
};

export type ManagedModal = ManagedEntity & Modal;

export type UniversalModalProps = ManagedModal & ModalHandlers;

export type ModalFrameProps = PropsWithChildren<UniversalModalProps>;

export type ModalHandlers = {
  onConfirm: (modalId: ManagedModal['id']) => void;
  onClose: (modalId: ManagedModal['id']) => void;
  onChange: (
    modalId: ManagedModal['id'],
    changeEvent: ChangeEvent<{ value?: any }> | any,
  ) => void;
  onCleanup: (modalId: ManagedModal['id']) => void;
};
