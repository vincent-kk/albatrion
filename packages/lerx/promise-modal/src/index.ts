export {
  useConfigurationOptions as useModalOptions,
  useConfigurationDuration as useModalDuration,
  useConfigurationBackdrop as useModalBackdrop,
} from './providers';

export {
  useBootstrap as useInitializeModal,
  BootstrapProvider as ModalProvider,
  type BootstrapProviderHandle as ModalProviderHandle,
  type BootstrapProviderProps as ModalProviderProps,
} from './bootstrap';

export { useSubscribeModal } from './hooks/useSubscribeModal';
export { useDestroyAfter } from './hooks/useDestroyAfter';
export { useActiveModalCount } from './hooks/useActiveModalCount';
export { useModalAnimation } from './hooks/useModalAnimation';

export { alert, confirm, prompt } from './core';

export type {
  ModalOptions,
  ModalFrameProps,
  FooterComponentProps,
  ModalBackground,
  PromptInputProps,
  AlertContentProps,
  ConfirmContentProps,
  PromptContentProps,
  WrapperComponentProps,
} from './types';
