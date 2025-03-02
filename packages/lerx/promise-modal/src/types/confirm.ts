import type { ComponentType, ReactNode } from 'react';

import type { Dictionary } from '@aileron/types';

import type { BaseModal, ContentComponentProps, FooterOptions } from './base';

export type ConfirmFooterRender<Context extends Dictionary = Dictionary> =
  (props: {
    onConfirm: VoidFunction;
    onCancel: VoidFunction;
    context: Context;
  }) => ReactNode;

export type ConfirmContentProps<Context extends Dictionary = Dictionary> =
  ContentComponentProps<Context>;

export interface ConfirmModal<B = any, Context extends Dictionary = Dictionary>
  extends BaseModal<boolean, B> {
  type: 'confirm';
  subtype?: 'info' | 'success' | 'warning' | 'error';
  content?: ReactNode | ComponentType<ConfirmContentProps<Context>>;
  footer?: ConfirmFooterRender<Context> | FooterOptions | false;
}
