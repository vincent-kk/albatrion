import type { ComponentType, ReactNode } from 'react';

import type { Dictionary, SetStateFn } from '@aileron/declare';

import type { BaseModal, ContentComponentProps, FooterOptions } from './base';

export type PromptFooterRender<
  T,
  Context extends Dictionary = Dictionary,
> = (props: {
  value: T | undefined;
  onChange: SetStateFn<T | undefined>;
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
  disabled: boolean;
  context: Context;
}) => ReactNode;

export interface PromptInputProps<T, Context extends Dictionary = Dictionary> {
  value?: T;
  defaultValue?: T;
  onChange: SetStateFn<T | undefined>;
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
  context: Context;
}

export type PromptContentProps<Context extends Dictionary = Dictionary> =
  ContentComponentProps<Context>;

export interface PromptModal<
  T = any,
  B = any,
  Context extends Dictionary = Dictionary,
> extends BaseModal<T, B> {
  type: 'prompt';
  content?: ReactNode | ComponentType<PromptContentProps<Context>>;
  defaultValue?: T;
  Input: (props: PromptInputProps<T, Context>) => ReactNode;
  disabled?: (value: T | undefined) => boolean;
  returnOnCancel?: boolean;
  footer?: PromptFooterRender<T, Context> | FooterOptions | false;
}
