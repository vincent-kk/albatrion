import { useOnMount, useVersion } from '@winglet/react-utils';

import type { ModalNode } from '@/promise-modal/core';

export const useSubscribeModal = (modal?: ModalNode) => {
  const [version, update] = useVersion();
  useOnMount(() => {
    if (!modal) return;
    const unsubscribe = modal.subscribe(update);
    return unsubscribe;
  });
  return version;
};
