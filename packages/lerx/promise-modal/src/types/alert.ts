import type { ComponentType, ReactNode } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { BaseModal, ContentComponentProps, FooterOptions } from './base';

export type AlertFooterRender<Context extends Dictionary = object> = (props: {
  onConfirm: VoidFunction;
  context: Context;
}) => ReactNode;

export type AlertContentProps<Context extends Dictionary = object> = Pick<
  ContentComponentProps<Context>,
  'onConfirm'
>;

export interface AlertModal<B = any, Context extends Dictionary = object>
  extends BaseModal<void, B> {
  type: 'alert';
  subtype?: 'info' | 'success' | 'warning' | 'error';
  content?: ReactNode | ComponentType<AlertContentProps<Context>>;
  footer?:
    | AlertFooterRender<Context>
    | Pick<FooterOptions, 'confirm' | 'hideConfirm'>
    | false;
}
