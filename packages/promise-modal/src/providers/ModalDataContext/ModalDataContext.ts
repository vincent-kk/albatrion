import { createContext } from 'react';

import { undefinedFunction } from '@lumy-pack/common';

import type {
  ManagedModal,
  ModalHandlers,
  ModalHandlersWithId,
} from '@/promise-modal/types';

export interface ModalDataContextProps extends ModalHandlersWithId {
  modalIds: ManagedModal['id'][];
  getModalData: (id: ManagedModal['id']) => ManagedModal | undefined;
  hideModal: (id: ManagedModal['id']) => void;
  getModalHandlers: (id: ManagedModal['id']) => ModalHandlers;
}

export const ModalDataContext = createContext<ModalDataContextProps>({
  modalIds: [],
  getModalData: undefinedFunction,
  hideModal: undefinedFunction,
  onChange: undefinedFunction,
  onConfirm: undefinedFunction,
  onClose: undefinedFunction,
  onDestroy: undefinedFunction,
  getModalHandlers: () => ({
    getModalData: undefinedFunction,
    onConfirm: undefinedFunction,
    onClose: undefinedFunction,
    onChange: undefinedFunction,
    onDestroy: undefinedFunction,
  }),
});
