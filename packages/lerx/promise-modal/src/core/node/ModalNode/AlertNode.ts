import type { ComponentType, ReactNode } from 'react';

import type {
  AlertContentProps,
  AlertFooterRender,
  AlertModal,
} from '@/promise-modal/types/alert';
import type { FooterOptions } from '@/promise-modal/types/base';
import type { ManagedEntity } from '@/promise-modal/types/modal';

import { AbstractNode } from './AbstractNode';

type AlertNodeProps<B> = AlertModal<B> & ManagedEntity;

export class AlertNode<B = any> extends AbstractNode<null, B> {
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
    duration,
    manualDestroy,
    closeOnBackdropClick,
    closeOnEscape,
    trapFocus,
    lockScroll,
    handleResolve,
    handleReject,
    ForegroundComponent,
    BackgroundComponent,
  }: AlertNodeProps<B>) {
    super({
      id,
      group,
      subtype,
      initiator,
      title,
      subtitle,
      background,
      dimmed,
      duration,
      manualDestroy,
      closeOnBackdropClick,
      closeOnEscape,
      trapFocus,
      lockScroll,
      handleResolve,
      handleReject,
      ForegroundComponent,
      BackgroundComponent,
    });
    this.type = type;
    this.subtype = subtype;
    this.content = content;
    this.footer = footer;
  }

  onClose() {
    this.onResolve(null);
  }

  onConfirm() {
    this.onResolve(null);
  }
}
