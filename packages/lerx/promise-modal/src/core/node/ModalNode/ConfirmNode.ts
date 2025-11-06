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
    manualDestroy,
    closeOnBackdropClick,
    resolver,
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
      manualDestroy,
      closeOnBackdropClick,
      resolver,
      ForegroundComponent,
      BackgroundComponent,
    });
    this.type = type;
    this.subtype = subtype;
    this.content = content;
    this.footer = footer;
  }

  onClose() {
    this.handleResolve(false);
  }

  onConfirm() {
    this.handleResolve(true);
  }
}
