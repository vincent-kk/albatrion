import { openModal } from '@/promise-modal/components/Anchor';
import type { ConfirmModal } from '@/promise-modal/types';

export const confirm = <B = any>(
  props: Omit<ConfirmModal<B>, 'type' | 'resolve'>,
) => {
  return new Promise<boolean>((resolve, reject) => {
    try {
      openModal({
        ...props,
        type: 'confirm',
        resolve: (result) => resolve(result ?? false),
      });
    } catch (error) {
      reject(error);
    }
  });
};
