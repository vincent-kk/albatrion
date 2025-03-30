export {
  ModalContextProvider as ModalProvider,
  useModalOptions,
  useModalDuration,
  useModalBackdrop,
} from './providers';

export { useSubscribeModal } from './hooks/useSubscribeModal';
export { useDestroyAfter } from './hooks/useDestroyAfter';
export { useActiveModalCount } from './hooks/useActiveModalCount';
export { useModalAnimation } from './hooks/useModalAnimation';

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
