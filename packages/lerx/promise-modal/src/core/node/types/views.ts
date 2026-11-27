import type { Fn } from '@aileron/declare';

import type { ModalNode } from '../type';

export type ModalActions = {
  modal: ModalNode | undefined;
  onConfirm: Fn;
  onClose: Fn;
  onChange: Fn<[value: any]>;
  onDestroy: Fn;
};

/** Read-only metadata for application predicates, without mutation methods. */
export type ModalNodeView = Readonly<
  Pick<
    ModalNode,
    | 'id'
    | 'type'
    | 'group'
    | 'subtype'
    | 'initiator'
    | 'alive'
    | 'visible'
    | 'settled'
    | 'dimmed'
    | 'manualDestroy'
    | 'closeOnBackdropClick'
    | 'closeOnEscape'
    | 'duration'
  >
>;
