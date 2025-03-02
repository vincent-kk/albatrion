export {
  ModalContextProvider as ModalProvider,
  useModalOptions,
  useModalDuration,
  useModalBackdrop,
} from './providers';

export { useSubscribeModal } from './hooks/useSubscribeModal';
export { useDestroyAfter } from './hooks/useDestroyAfter';

export { alert, confirm, prompt } from './core';

export type {
  ModalFrameProps,
  FooterComponentProps,
  ModalBackground,
  PromptInputProps,
  AlertContentProps,
  ConfirmContentProps,
  PromptContentProps,
  WrapperComponentProps,
} from './types';
