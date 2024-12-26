import type { ComponentType, ReactNode } from 'react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import type {
  AlertContentProps,
  AlertFooterRender,
  FooterOptions,
  ModalBackground,
} from '@/promise-modal/types';

interface AlertProps<B> {
  subtype?: 'info' | 'success' | 'warning' | 'error';
  title?: ReactNode;
  subtitle?: ReactNode;
  content?: ReactNode | ComponentType<AlertContentProps>;
  background?: ModalBackground<B>;
  footer?:
    | AlertFooterRender
    | Pick<FooterOptions, 'confirm' | 'hideConfirm'>
    | false;
  manualDestroy?: boolean;
  closeOnBackdropClick?: boolean;
}

export const alert = <B = any>({
  subtype,
  title,
  subtitle,
  content,
  background,
  footer,
  manualDestroy,
  closeOnBackdropClick,
}: AlertProps<B>) => {
  return new Promise<void>((resolve, reject) => {
    try {
      ModalManager.open({
        type: 'alert',
        subtype,
        resolve: () => resolve(),
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
