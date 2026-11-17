import type { Dictionary, Fn } from '@aileron/declare';

import type { ModalBackground } from './background';

export type ModalFrameProps<Context extends Dictionary = object, B = any> = {
  id: number;
  type: 'alert' | 'confirm' | 'prompt';
  /** Presentation variant, independent of modal kind. */
  subtype?: 'info' | 'success' | 'warning' | 'error';
  /** Application-defined grouping key. */
  group?: string;
  /** Whether the result has been confirmed, cancelled, or rejected. */
  settled: boolean;
  alive: boolean;
  visible: boolean;
  initiator: string;
  manualDestroy: boolean;
  closeOnBackdropClick: boolean;
  background?: ModalBackground<B>;
  onConfirm: Fn;
  onClose: Fn;
  onChange: Fn<[value: any]>;
  onDestroy: Fn;
  onChangeOrder: Fn;
  context: Context;
};
