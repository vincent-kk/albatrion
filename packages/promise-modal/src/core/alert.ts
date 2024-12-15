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
  title: string;
  subtitle?: ReactNode;
  content?: ReactNode | ComponentType<AlertContentProps>;
  background?: ModalBackground<B>;
  footer?:
    | AlertFooterRender
    | Pick<FooterOptions, 'confirm' | 'hideConfirm'>
    | false;
}

export const alert = <B = any>({
  subtype,
  title,
  subtitle,
  content,
  background,
  footer,
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
      });
    } catch (error) {
      reject(error);
    }
  });
};
