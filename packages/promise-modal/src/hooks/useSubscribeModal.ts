import { useOnMount, useTick } from '@lumy-pack/common-react';

import { useModalDataContext } from '@/promise-modal/providers';

export const useSubscribeModal = (modalId: number) => {
  const [tick, update] = useTick();
  const { getModalData } = useModalDataContext();
  useOnMount(() => {
    const modal = getModalData(modalId);
    if (!modal) return;
    const unsubscribe = modal.subscribe(update);
    return unsubscribe;
  });
  return tick;
};
