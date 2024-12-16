import { useContext, useMemo } from 'react';

import type { ManagedModal } from '@/promise-modal/types';

import { ModalDataContext } from './ModalDataContext';

export const useModalDataContext = () => useContext(ModalDataContext);

export const useModal = (id: ManagedModal['id']) => {
  const { getModal } = useModalDataContext();
  return useMemo(() => getModal(id), [id, getModal]);
};
