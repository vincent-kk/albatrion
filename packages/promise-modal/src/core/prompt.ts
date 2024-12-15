import type { ComponentType, ReactNode } from 'react';

import type {
  FooterOptions,
  ModalBackground,
  PromptContentProps,
  PromptFooterRender,
  PromptInputProps,
} from '@/promise-modal/types';

import { ModalManager } from '../app/ModalManager';

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
}: PromptProps<T, B>) => {
  return new Promise<T>((resolve, reject) => {
    try {
      ModalManager.open({
        type: 'prompt',
        resolve: (result) => resolve(result as T),
        title,
        subtitle,
        content,
        Input: ({ defaultValue, onChange, onConfirm }: PromptInputProps<T>) =>
          Input({
            defaultValue,
            onChange,
            onConfirm,
          }),
        value: defaultValue,
        disabled,
        returnOnCancel,
        background,
        footer,
      });
    } catch (error) {
      reject(error);
    }
  });
};
