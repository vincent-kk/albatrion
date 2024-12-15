import { useContext } from 'react';

import type { ManagedModal } from '@/promise-modal/types';

import { ModalDataContext } from './ModalDataContext';

export const useModalDataContext = () => useContext(ModalDataContext);

export const useModalHandlers = (id: ManagedModal['id']) => {
  const { getModalHandlers } = useModalDataContext();
  return getModalHandlers(id);
};
