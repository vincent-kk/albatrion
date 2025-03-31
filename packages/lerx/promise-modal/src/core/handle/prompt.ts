import type { ComponentType, ReactNode } from 'react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import type {
  BackgroundComponent,
  FooterOptions,
  ForegroundComponent,
  ModalBackground,
  PromptContentProps,
  PromptFooterRender,
  PromptInputProps,
} from '@/promise-modal/types';

interface PromptProps<T, B = any> {
  title?: ReactNode;
  subtitle?: ReactNode;
  content?: ReactNode | ComponentType<PromptContentProps>;
  Input: (props: PromptInputProps<T>) => ReactNode;
  defaultValue?: T;
  disabled?: (value: T) => boolean;
  returnOnCancel?: boolean;
  background?: ModalBackground<B>;
  footer?: PromptFooterRender<T> | FooterOptions | false;
  dimmed?: boolean;
  manualDestroy?: boolean;
  closeOnBackdropClick?: boolean;
  ForegroundComponent?: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
}

export const prompt = <T, B = any>({
  defaultValue,
  title,
  subtitle,
  content,
  Input,
  disabled,
  returnOnCancel,
  background,
  footer,
  dimmed,
  manualDestroy,
  closeOnBackdropClick,
  ForegroundComponent,
  BackgroundComponent,
}: PromptProps<T, B>) => {
  return new Promise<T>((resolve, reject) => {
    try {
      ModalManager.open({
        type: 'prompt',
        resolve: (result) => resolve(result as T),
        title,
        subtitle,
        content,
        Input,
        defaultValue,
        disabled,
        returnOnCancel,
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
