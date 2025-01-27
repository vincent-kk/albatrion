import type { ComponentType, ReactNode } from 'react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import type {
  BackgroundComponent,
  ConfirmContentProps,
  ConfirmFooterRender,
  FooterOptions,
  ForegroundComponent,
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
  ForegroundComponent?: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
}

export const confirm = <B = any>({
  subtype,
  title,
  subtitle,
  content,
  background,
  footer,
  manualDestroy,
  closeOnBackdropClick,
  ForegroundComponent,
  BackgroundComponent,
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
        ForegroundComponent,
        BackgroundComponent,
      });
    } catch (error) {
      reject(error);
    }
  });
};
