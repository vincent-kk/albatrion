export { default as ModalProvider } from './providers/ModalProvider';

export { alert, confirm, prompt } from './handler';

export {
  useModalOptions,
  useModalDuration,
  useModalBackdrop,
} from './hooks/useModalOptions';

export type {
  ModalFrameProps,
  FooterComponentProps,
  ModalBackground,
  PromptInputProps,
  AlertContentProps,
  ConfirmContentProps,
  PromptContentProps,
} from './types';
