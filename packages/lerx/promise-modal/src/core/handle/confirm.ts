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
  group?: string;
  subtype?: 'info' | 'success' | 'warning' | 'error';
  title?: ReactNode;
  subtitle?: ReactNode;
  content?: ReactNode | ComponentType<ConfirmContentProps>;
  background?: ModalBackground<B>;
  footer?: ConfirmFooterRender | FooterOptions | false;
  dimmed?: boolean;
  manualDestroy?: boolean;
  closeOnBackdropClick?: boolean;
  ForegroundComponent?: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
}

export const confirm = <B = any>({
  group,
  subtype,
  title,
  subtitle,
  content,
  background,
  footer,
  dimmed,
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
        dimmed,
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
