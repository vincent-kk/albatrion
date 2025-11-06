import type { ComponentType, ReactNode } from 'react';

import type {
  AlertContentProps,
  AlertFooterRender,
  AlertModal,
  FooterOptions,
  ManagedEntity,
} from '@/promise-modal/types';

import { AbstractNode } from './AbstractNode';

type AlertNodeProps<B> = AlertModal<B> & ManagedEntity;

export class AlertNode<B> extends AbstractNode<null, B> {
  readonly type: 'alert';
  readonly subtype?: 'info' | 'success' | 'warning' | 'error';
  readonly content?: ReactNode | ComponentType<AlertContentProps>;
  readonly footer?:
    | AlertFooterRender
    | Pick<FooterOptions, 'confirm' | 'hideConfirm'>
    | false;

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
  }: AlertNodeProps<B>) {
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
    this.handleResolve(null);
  }

  onConfirm() {
    this.handleResolve(null);
  }
}
