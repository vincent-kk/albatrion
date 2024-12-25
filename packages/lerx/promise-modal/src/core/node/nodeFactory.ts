import type { ManagedModal } from '@/promise-modal/types';

import { AlertNode, ConfirmNode, PromptNode } from './ModalNode';

export const nodeFactory = <T, B>(modal: ManagedModal<T, B>) => {
  switch (modal.type) {
    case 'alert':
      return new AlertNode<B>(modal);
    case 'confirm':
      return new ConfirmNode<B>(modal);
    case 'prompt':
      return new PromptNode<T, B>(modal);
  }
  // @ts-expect-error: This state is unreachable by design and should NEVER occur.
  throw new Error(`Unknown modal: ${modal.type}`, { modal });
};
