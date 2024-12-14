import { openModal } from './components/Anchor';
import type {
  AlertModal,
  ConfirmModal,
  PromptInputProps,
  PromptModal,
} from './types';

export const alert = <B = any>(
  props: Omit<AlertModal<B>, 'type' | 'resolve'>,
) => {
  return new Promise<void>((resolve, reject) => {
    try {
      openModal({
        ...props,
        type: 'alert',
        resolve: () => resolve(),
      });
    } catch (error) {
      reject(error);
    }
  });
};
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
export const prompt = <T, B = any>({
  defaultValue,
  ...props
}: Omit<PromptModal<T, B>, 'type' | 'value' | 'resolve'> & {
  defaultValue?: T;
}) => {
  return new Promise<T>((resolve, reject) => {
    try {
      openModal({
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
