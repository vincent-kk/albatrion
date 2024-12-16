import type { PropsWithChildren } from 'react';

import type { ModalNode } from '@/promise-modal/core';

import type { AlertModal } from './alert';
import type { ConfirmModal } from './confirm';
import type { PromptModal } from './prompt';

export type Modal<T = any, B = any> =
  | AlertModal<B>
  | ConfirmModal<B>
  | PromptModal<T, B>;

export type ManagedEntity = {
  id: number;
  initiator: string;
};

export type ManagedModal<T = any, B = any> = ManagedEntity & Modal<T, B>;

export type UniversalModalProps = {
  modal: ModalNode;
  handlers: Omit<ModalActions, 'modal'> & {
    onChangeOrder: Fn;
  };
};

export type ModalFrameProps = PropsWithChildren<UniversalModalProps>;

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
