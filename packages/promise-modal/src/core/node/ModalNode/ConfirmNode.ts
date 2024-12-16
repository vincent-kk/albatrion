import type { ComponentType, ReactNode } from 'react';

import type {
  ConfirmContentProps,
  ConfirmFooterRender,
  ConfirmModal,
  FooterOptions,
  ManagedEntity,
} from '@/promise-modal/types';

import { BaseNode } from './BaseNode';

type ConfirmNodeProps<B> = ConfirmModal<B> & ManagedEntity;

export class ConfirmNode<B> extends BaseNode<boolean, B> {
  readonly type: 'confirm';
  readonly subtype?: 'info' | 'success' | 'warning' | 'error';
  readonly content?: ReactNode | ComponentType<ConfirmContentProps>;
  readonly footer?: ConfirmFooterRender | FooterOptions | false;

  constructor({
    id,
    initiator,
    type,
    subtype,
    title,
    subtitle,
    content,
    footer,
    background,
    manualDestroy,
    closeOnBackdropClick,
    resolve,
  }: ConfirmNodeProps<B>) {
    super({
      id,
      initiator,
      title,
      subtitle,
      background,
      manualDestroy,
      closeOnBackdropClick,
      resolve,
    });
    this.type = type;
    this.subtype = subtype;
    this.content = content;
    this.footer = footer;
  }
  onClose() {
    this.resolve(false);
  }
  onConfirm() {
    this.resolve(true);
  }
}
