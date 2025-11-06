import type { ComponentType, ReactNode } from 'react';

import type {
  ConfirmContentProps,
  ConfirmFooterRender,
  ConfirmModal,
  FooterOptions,
  ManagedEntity,
} from '@/promise-modal/types';

import { AbstractNode } from './AbstractNode';

type ConfirmNodeProps<B> = ConfirmModal<B> & ManagedEntity;

export class ConfirmNode<B> extends AbstractNode<boolean, B> {
  readonly type: 'confirm';
  readonly subtype?: 'info' | 'success' | 'warning' | 'error';
  readonly content?: ReactNode | ComponentType<ConfirmContentProps>;
  readonly footer?: ConfirmFooterRender | FooterOptions | false;

  constructor({
    id,
    group,
    initiator,
    type,
    subtype,
    title,
    subtitle,
    content,
    footer,
    background,
    dimmed,
    duration,
    manualDestroy,
    closeOnBackdropClick,
    handleResolve,
    ForegroundComponent,
    BackgroundComponent,
  }: ConfirmNodeProps<B>) {
    super({
      id,
      group,
      initiator,
      title,
      subtitle,
      background,
      dimmed,
      duration,
      manualDestroy,
      closeOnBackdropClick,
      handleResolve,
      ForegroundComponent,
      BackgroundComponent,
    });
    this.type = type;
    this.subtype = subtype;
    this.content = content;
    this.footer = footer;
  }

  onClose() {
    this.onResolve(false);
  }

  onConfirm() {
    this.onResolve(true);
  }
}
