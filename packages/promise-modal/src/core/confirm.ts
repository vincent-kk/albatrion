import { ModalManager } from '@/promise-modal/app/ModalManager';
import type { ConfirmModal } from '@/promise-modal/types';

export const confirm = <B = any>(
  props: Omit<ConfirmModal<B>, 'type' | 'resolve'>,
) => {
  return new Promise<boolean>((resolve, reject) => {
    try {
      ModalManager.open({
        ...props,
        type: 'confirm',
        resolve: (result) => resolve(result ?? false),
      });
    } catch (error) {
      reject(error);
    }
  });
};
