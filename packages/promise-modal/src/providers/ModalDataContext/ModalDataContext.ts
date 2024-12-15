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
  getModalHandlers: (id: ManagedModal['id']) => ModalHandlers;
  setUpdater: (updater: Fn) => void;
}

export const ModalDataContext = createContext<ModalDataContextProps>({
  modalIds: [],
  getModalData: undefinedFunction,
  onChange: undefinedFunction,
  onConfirm: undefinedFunction,
  onClose: undefinedFunction,
  onDestroy: undefinedFunction,
  setUpdater: undefinedFunction,
  getModalHandlers: () => ({
    getModalData: undefinedFunction,
    onConfirm: undefinedFunction,
    onClose: undefinedFunction,
    onChange: undefinedFunction,
    onDestroy: undefinedFunction,
  }),
});
