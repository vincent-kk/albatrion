import { ModalManager } from '@/promise-modal/app/ModalManager';
import type { AlertModal } from '@/promise-modal/types';

export const alert = <B = any>(
  props: Omit<AlertModal<B>, 'type' | 'resolve'>,
) => {
  return new Promise<void>((resolve, reject) => {
    try {
      ModalManager.open({
        ...props,
        type: 'alert',
        resolve: () => resolve(),
      });
    } catch (error) {
      reject(error);
    }
  });
};
