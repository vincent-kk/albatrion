import { useContext, useMemo } from 'react';

import type { ManagedModal } from '@/promise-modal/types/modal';

import { ModalManagerContext } from './ModalManagerContext';

export const useModalManagerContext = () => {
  const context = useContext(ModalManagerContext);
  if (!context) throw new Error('[promise-modal] Modal manager hooks must be used inside a modal tree.');
  return context;
};

export const useModalManager = (id?: ManagedModal['id']) => {
  const { getModal } = useModalManagerContext();
  return useMemo(() => getModal(id), [id, getModal]);
};
