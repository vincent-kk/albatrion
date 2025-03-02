import type { ComponentType, ReactNode } from 'react';

import type { Dictionary } from '@aileron/types';

import type { BaseModal, ContentComponentProps, FooterOptions } from './base';

export type AlertFooterRender = (props: {
  onConfirm: VoidFunction;
  context: Dictionary;
}) => ReactNode;

export type AlertContentProps = Pick<ContentComponentProps, 'onConfirm'>;

export interface AlertModal<B> extends BaseModal<void, B> {
  type: 'alert';
  subtype?: 'info' | 'success' | 'warning' | 'error';
  content?: ReactNode | ComponentType<AlertContentProps>;
  footer?:
    | AlertFooterRender
    | Pick<FooterOptions, 'confirm' | 'hideConfirm'>
    | false;
}
