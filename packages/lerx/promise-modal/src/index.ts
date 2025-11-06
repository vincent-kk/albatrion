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

export { useModal } from './hooks/useModal';
export { useActiveModalCount } from './hooks/useActiveModalCount';
export { useDestroyAfter } from './hooks/useDestroyAfter';
export { useModalAnimation } from './hooks/useModalAnimation';
export { useSubscribeModal } from './hooks/useSubscribeModal';

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
