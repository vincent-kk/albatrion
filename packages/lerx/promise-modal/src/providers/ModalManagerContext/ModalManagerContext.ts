import { createContext } from 'react';

import type { Fn } from '@aileron/types';

import type { ModalNode } from '@/promise-modal/core';
import type { ModalActions, ModalHandlersWithId } from '@/promise-modal/types';

export interface ModalManagerContextProps extends ModalHandlersWithId {
  modalIds: ModalNode['id'][];
  getModal: Fn<[id: ModalNode['id']], ModalActions>;
  getModalNode: Fn<[id: ModalNode['id']], ModalNode | undefined>;
  setUpdater: Fn<[updater: Fn]>;
}

export const ModalManagerContext = createContext<ModalManagerContextProps>(
  {} as ModalManagerContextProps,
);
