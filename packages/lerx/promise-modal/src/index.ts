export {
  useConfigurationOptions as useModalOptions,
  useConfigurationBackdrop as useModalBackdrop,
} from './providers';

export {
  useBootstrap as useInitializeModal,
  BootstrapProvider as ModalProvider,
  type BootstrapProviderHandle as ModalProviderHandle,
  type BootstrapProviderProps as ModalProviderProps,
} from './bootstrap';

export { useModal } from './core';
export { useActiveModalCount } from './app';
export { useDestroyAfter } from './providers';
export { useModalAnimation } from './hooks/useModalAnimation';
export { useModalDuration } from './providers';
export { useSubscribeModal } from './app';

export { alert, confirm, prompt } from './core';
export type {
  AlertProps,
  ConfirmProps,
  PromptProps,
  OverridableHandleProps,
} from './core';

export type { ModalOptions } from './types/option';
export type { ModalNodeView } from './core';
export type { ModalFrameProps } from './types/frame';
export type { FooterComponentProps, WrapperComponentProps } from './types/base';
export type { ModalBackground } from './types/background';
export type { PromptInputProps, PromptContentProps } from './types/prompt';
export type { AlertContentProps } from './types/alert';
export type { ConfirmContentProps } from './types/confirm';
