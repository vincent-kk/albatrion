import type { ComponentType, ReactNode } from 'react';

import type {
  AlertContentProps,
  AlertFooterRender,
  AlertModal,
  FooterOptions,
  ManagedEntity,
} from '@/promise-modal/types';

import { BaseNode } from './AbstractBaseNode';

type AlertNodeProps<B> = AlertModal<B> & ManagedEntity;

export class AlertNode<B> extends BaseNode<null, B> {
  readonly type: 'alert';
  readonly subtype?: 'info' | 'success' | 'warning' | 'error';
  readonly content?: ReactNode | ComponentType<AlertContentProps>;
  readonly footer?:
    | AlertFooterRender
    | Pick<FooterOptions, 'confirm' | 'hideConfirm'>
    | false;

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
    ForegroundComponent,
    BackgroundComponent,
  }: AlertNodeProps<B>) {
    super({
      id,
      initiator,
      title,
      subtitle,
      background,
      manualDestroy,
      closeOnBackdropClick,
      resolve,
      ForegroundComponent,
      BackgroundComponent,
    });
    this.type = type;
    this.subtype = subtype;
    this.content = content;
    this.footer = footer;
  }
  onClose() {
    this.resolve(null);
  }
  onConfirm() {
    this.resolve(null);
  }
}
