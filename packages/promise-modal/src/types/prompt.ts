import type { ComponentType, ReactNode } from 'react';

import type { BaseModal, ContentComponentProps, FooterOptions } from './base';

export type PromptFooterRender<T> = (props: {
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
  value: T;
  onChange: SetStateFn<T>;
  disabled: boolean;
}) => ReactNode;

export interface PromptInputProps<T> {
  value?: T;
  defaultValue?: T;
  onChange: SetStateFn<T>;
  onConfirm?: VoidFunction;
}

export type PromptContentProps = ContentComponentProps;

export interface PromptModal<T = Record<string, any>, B = any>
  extends BaseModal<T, B> {
  type: 'prompt';
  content?: ReactNode | ComponentType<PromptContentProps>;
  Input: (props: PromptInputProps<T>) => ReactNode;
  value: T;
  disabled?: (value: T) => boolean;
  returnOnCancel?: boolean;
  footer?: PromptFooterRender<T> | FooterOptions | false;
}
