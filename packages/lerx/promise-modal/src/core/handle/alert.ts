import type { ComponentType, ReactNode } from 'react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import type {
  AlertContentProps,
  AlertFooterRender,
  BackgroundComponent,
  FooterOptions,
  ForegroundComponent,
  ModalBackground,
} from '@/promise-modal/types';

interface AlertProps<B> {
  group?: string;
  subtype?: 'info' | 'success' | 'warning' | 'error';
  title?: ReactNode;
  subtitle?: ReactNode;
  content?: ReactNode | ComponentType<AlertContentProps>;
  background?: ModalBackground<B>;
  footer?:
    | AlertFooterRender
    | Pick<FooterOptions, 'confirm' | 'hideConfirm'>
    | false;
  dimmed?: boolean;
  manualDestroy?: boolean;
  closeOnBackdropClick?: boolean;
  ForegroundComponent?: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
}

export const alert = <B = any>({
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
