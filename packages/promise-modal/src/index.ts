export {
  ModalContextProvider as ModalProvider,
  useModalOptions,
  useModalDuration,
  useModalBackdrop,
} from './providers';

export { alert, confirm, prompt } from './core/handler';

export type {
  ModalFrameProps,
  FooterComponentProps,
  ModalBackground,
  PromptInputProps,
  AlertContentProps,
  ConfirmContentProps,
  PromptContentProps,
} from './types';
