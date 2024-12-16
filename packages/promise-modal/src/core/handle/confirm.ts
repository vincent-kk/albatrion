import type { ComponentType, ReactNode } from 'react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import type {
  ConfirmContentProps,
  ConfirmFooterRender,
  FooterOptions,
  ModalBackground,
} from '@/promise-modal/types';

interface ConfirmProps<B> {
  subtype?: 'info' | 'success' | 'warning' | 'error';
  title?: ReactNode;
  subtitle?: ReactNode;
  content?: ReactNode | ComponentType<ConfirmContentProps>;
  background?: ModalBackground<B>;
  footer?: ConfirmFooterRender | FooterOptions | false;
  closeOnBackdropClick?: boolean;
  manualDestroy?: boolean;
}

export const confirm = <B = any>({
  subtype,
  title,
  subtitle,
  content,
  background,
  footer,
  manualDestroy = false,
  closeOnBackdropClick = true,
}: ConfirmProps<B>) => {
  return new Promise<boolean>((resolve, reject) => {
    try {
      ModalManager.open({
        type: 'confirm',
        subtype,
        resolve: (result) => resolve(result ?? false),
        title,
        subtitle,
        content,
        background,
        footer,
        manualDestroy,
        closeOnBackdropClick,
      });
    } catch (error) {
      reject(error);
    }
  });
};
