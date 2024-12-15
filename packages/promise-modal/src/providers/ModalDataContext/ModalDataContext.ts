import { createContext } from 'react';

import { undefinedFunction } from '@lumy-pack/common';

import type {
  ManagedModal,
  ModalHandlers,
  ModalHandlersWithId,
} from '@/promise-modal/types';

export interface ModalDataContextProps extends ModalHandlersWithId {
  modalIds: ManagedModal['id'][];
  getModalData: Fn<[id: ManagedModal['id']], ManagedModal | undefined>;
  getModalHandlers: Fn<[id: ManagedModal['id']], ModalHandlers>;
  setUpdater: Fn<[updater: Fn]>;
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
