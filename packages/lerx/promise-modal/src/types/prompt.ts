import type { ComponentType, ReactNode } from 'react';

import type { SetStateFn } from '@aileron/types';

import type { BaseModal, ContentComponentProps, FooterOptions } from './base';

export type PromptFooterRender<T> = (props: {
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
  value: T | undefined;
  onChange: SetStateFn<T | undefined>;
  disabled: boolean;
}) => ReactNode;

export interface PromptInputProps<T> {
  value?: T;
  defaultValue?: T;
  onChange: SetStateFn<T | undefined>;
  onConfirm?: VoidFunction;
  onCancel?: VoidFunction;
}

export type PromptContentProps = ContentComponentProps;

export interface PromptModal<T = any, B = any> extends BaseModal<T, B> {
  type: 'prompt';
  content?: ReactNode | ComponentType<PromptContentProps>;
  defaultValue?: T;
  Input: (props: PromptInputProps<T>) => ReactNode;
  disabled?: (value: T | undefined) => boolean;
  returnOnCancel?: boolean;
  footer?: PromptFooterRender<T> | FooterOptions | false;
}
