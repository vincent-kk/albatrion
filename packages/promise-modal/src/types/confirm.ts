import type { ComponentType, ReactNode } from 'react';

import type { BaseModal, ContentComponentProps, FooterOptions } from './base';

export type ConfirmFooterRender = (props: {
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
}) => ReactNode;

export type ConfirmContentProps = ContentComponentProps;

export interface ConfirmModal<B> extends BaseModal<boolean, B> {
  type: 'confirm';
  subtype?: 'info' | 'success' | 'warning' | 'error';
  content?: ReactNode | ComponentType<ConfirmContentProps>;
  footer?: ConfirmFooterRender | FooterOptions | false;
}
