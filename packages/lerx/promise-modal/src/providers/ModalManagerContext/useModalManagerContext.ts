import { useContext, useMemo } from 'react';

import type { ManagedModal } from '@/promise-modal/types';

import { ModalManagerContext } from './ModalManagerContext';

export const useModalManagerContext = () => useContext(ModalManagerContext);

export const useModalManager = (id: ManagedModal['id']) => {
  const { getModal } = useContext(ModalManagerContext);
  return useMemo(() => getModal(id), [id, getModal]);
};
