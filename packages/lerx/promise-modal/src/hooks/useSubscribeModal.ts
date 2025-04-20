import { useEffect } from 'react';

import { useVersion } from '@winglet/react-utils';

import type { ModalNode } from '@/promise-modal/core';

export const useSubscribeModal = (modal?: ModalNode) => {
  const [version, update] = useVersion();
  useEffect(() => {
    if (!modal) return;
    const unsubscribe = modal.subscribe(update);
    return unsubscribe;
  }, [modal, update]);
  return version;
};
