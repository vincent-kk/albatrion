import { useOnMount, useTick } from '@winglet/react-utils';

import type { ModalNode } from '@/promise-modal/core';

export const useSubscribeModal = (modal?: ModalNode) => {
  const [tick, update] = useTick();
  useOnMount(() => {
    if (!modal) return;
    const unsubscribe = modal.subscribe(update);
    return unsubscribe;
  });
  return tick;
};
