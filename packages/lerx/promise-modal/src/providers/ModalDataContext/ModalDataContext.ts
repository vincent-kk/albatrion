import { createContext } from 'react';

import { undefinedFunction } from '@winglet/common-utils';

import type { Fn } from '@aileron/types';

import type { ModalNode } from '@/promise-modal/core';
import type { ModalActions, ModalHandlersWithId } from '@/promise-modal/types';

export interface ModalDataContextProps extends ModalHandlersWithId {
  modalIds: ModalNode['id'][];
  getModal: Fn<[id: ModalNode['id']], ModalActions>;
  getModalNode: Fn<[id: ModalNode['id']], ModalNode | undefined>;
  setUpdater: Fn<[updater: Fn]>;
}

export const ModalDataContext = createContext<ModalDataContextProps>({
  modalIds: [],
  getModalNode: undefinedFunction,
  onChange: undefinedFunction,
  onConfirm: undefinedFunction,
  onClose: undefinedFunction,
  onDestroy: undefinedFunction,
  setUpdater: undefinedFunction,
  getModal: () => ({
    modal: undefined,
    onConfirm: undefinedFunction,
    onClose: undefinedFunction,
    onChange: undefinedFunction,
    onDestroy: undefinedFunction,
  }),
});
