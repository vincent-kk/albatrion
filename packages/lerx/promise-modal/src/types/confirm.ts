import type { ComponentType, ReactNode } from 'react';

import type { Dictionary } from '@aileron/types';

import type { BaseModal, ContentComponentProps, FooterOptions } from './base';

export type ConfirmFooterRender = (props: {
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
  context: Dictionary;
}) => ReactNode;

export type ConfirmContentProps = ContentComponentProps;

export interface ConfirmModal<B> extends BaseModal<boolean, B> {
  type: 'confirm';
  subtype?: 'info' | 'success' | 'warning' | 'error';
  content?: ReactNode | ComponentType<ConfirmContentProps>;
  footer?: ConfirmFooterRender | FooterOptions | false;
}
