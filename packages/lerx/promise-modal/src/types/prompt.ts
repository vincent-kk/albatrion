import type { ComponentType, ReactNode } from 'react';

import type { Dictionary, Fn, SetStateFn } from '@aileron/declare';

import type { BaseModal, ContentComponentProps, FooterOptions } from './base';

export type PromptFooterRender<T, Context extends Dictionary = object> = Fn<
  [
    props: {
      value: T | undefined;
      onChange: SetStateFn<T | undefined>;
      onConfirm: Fn;
      onCancel: Fn;
      disabled: boolean;
      context: Context;
    },
  ],
  ReactNode
>;

export interface PromptInputProps<T, Context extends Dictionary = object> {
  value?: T;
  defaultValue?: T;
  onChange: SetStateFn<T | undefined>;
  onConfirm: Fn;
  onCancel: Fn;
  context: Context;
}

export type PromptContentProps<Context extends Dictionary = object> =
  ContentComponentProps<Context>;

export interface PromptModal<
  T = any,
  B = any,
  Context extends Dictionary = object,
> extends BaseModal<T, B> {
  type: 'prompt';
  content?: ReactNode | ComponentType<PromptContentProps<Context>>;
  defaultValue?: T;
  Input: Fn<[props: PromptInputProps<T, Context>], ReactNode>;
  disabled?: Fn<[value: T | undefined], boolean>;
  returnOnCancel?: boolean;
  footer?: PromptFooterRender<T, Context> | FooterOptions | false;
}
