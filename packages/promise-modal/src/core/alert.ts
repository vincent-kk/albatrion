import { openModal } from '@/promise-modal/components/Anchor';
import type { AlertModal } from '@/promise-modal/types';

export const alert = <B = any>(
  props: Omit<AlertModal<B>, 'type' | 'resolve'>,
) => {
  return new Promise<void>((resolve, reject) => {
    try {
      openModal({
        ...props,
        type: 'alert',
        resolve: () => resolve(),
      });
    } catch (error) {
      reject(error);
    }
  });
};
