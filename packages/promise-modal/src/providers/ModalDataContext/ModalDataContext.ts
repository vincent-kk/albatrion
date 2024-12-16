import { createContext } from 'react';

import { undefinedFunction } from '@lumy-pack/common';

import type { ModalNode } from '@/promise-modal/core';
import type { ModalHandlers, ModalHandlersWithId } from '@/promise-modal/types';

export interface ModalDataContextProps extends ModalHandlersWithId {
  modalIds: ModalNode['id'][];
  getModalData: Fn<[id: ModalNode['id']], ModalNode | undefined>;
  getModalHandlers: Fn<[id: ModalNode['id']], ModalHandlers>;
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
