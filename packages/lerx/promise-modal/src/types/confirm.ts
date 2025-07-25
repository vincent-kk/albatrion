import type { ComponentType, ReactNode } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { BaseModal, ContentComponentProps, FooterOptions } from './base';

export type ConfirmFooterRender<Context extends Dictionary = object> = (props: {
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
  context: Context;
}) => ReactNode;

export type ConfirmContentProps<Context extends Dictionary = object> =
  ContentComponentProps<Context>;

export interface ConfirmModal<B = any, Context extends Dictionary = object>
  extends BaseModal<boolean, B> {
  type: 'confirm';
  subtype?: 'info' | 'success' | 'warning' | 'error';
  content?: ReactNode | ComponentType<ConfirmContentProps<Context>>;
  footer?: ConfirmFooterRender<Context> | FooterOptions | false;
}
