import type { PromptInputProps, PromptModal } from '@/promise-modal/types';

import { ModalManager } from '../app/ModalManager';

export const prompt = <T, B = any>({
  defaultValue,
  ...props
}: Omit<PromptModal<T, B>, 'type' | 'value' | 'resolve'> & {
  defaultValue?: T;
}) => {
  return new Promise<T>((resolve, reject) => {
    try {
      ModalManager.open({
        ...props,
        type: 'prompt',
        resolve: (result) => resolve(result as T),
        input: ({ value, onChange, onConfirm }: PromptInputProps<T>) =>
          props.input({ value, onChange, onConfirm }),
        value: defaultValue ?? null,
      });
    } catch (error) {
      reject(error);
    }
  });
};
