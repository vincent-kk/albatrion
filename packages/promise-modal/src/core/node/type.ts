import type { AlertNode, ConfirmNode, PromptNode } from './ModalNode';

export type ModalNode<T = any, B = any> =
  | AlertNode<B>
  | ConfirmNode<B>
  | PromptNode<T, B>;
