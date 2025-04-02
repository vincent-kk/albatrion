export {
  useConfigurationOptions as useModalOptions,
  useConfigurationDuration as useModalDuration,
  useConfigurationBackdrop as useModalBackdrop,
} from './providers';

export {
  Initialize as ModalProvider,
  type InitializeHandle as ModalProviderHandle,
  type InitializeProps as ModalProviderProps,
} from './providers/Initialize';

export { useSubscribeModal } from './hooks/useSubscribeModal';
export { useDestroyAfter } from './hooks/useDestroyAfter';
export { useActiveModalCount } from './hooks/useActiveModalCount';
export { useModalAnimation } from './hooks/useModalAnimation';

export { alert, confirm, prompt } from './core';

export { bootstrap } from './core/bootstrap';

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
