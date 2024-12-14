export { ModalContextProvider as ModalProvider } from './providers/ModalContextProvider';

export { alert, confirm, prompt } from './handler';

export {
  useModalOptions,
  useModalDuration,
  useModalBackdrop,
} from './providers/ModalContextProvider/useModalContext';

export type {
  ModalFrameProps,
  FooterComponentProps,
  ModalBackground,
  PromptInputProps,
  AlertContentProps,
  ConfirmContentProps,
  PromptContentProps,
} from './types';
