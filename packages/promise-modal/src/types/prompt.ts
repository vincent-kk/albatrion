import type { ComponentType, ReactNode } from 'react';

import type { BaseModal, ContentComponentProps, FooterOptions } from './base';

export type PromptFooterRender<T> = (props: {
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
  value: T | null;
  onChange: SetStateFunction<T>;
  disable: boolean;
}) => ReactNode;

export interface PromptInputProps<T> {
  value: T | null;
  onChange: SetStateFunction<T>;
  onConfirm?: VoidFunction;
}

export type PromptContentProps = ContentComponentProps;

export interface PromptModal<T = Record<string, any>, B = any>
  extends BaseModal<T, B> {
  type: 'prompt';
  content?: ReactNode | ComponentType<PromptContentProps>;
  input: (props: PromptInputProps<T>) => ReactNode;
  value: T | null;
  disabled?: (value: T | null) => boolean;
  immediate?: boolean;
  returnOnCancel?: boolean;
  footer?: PromptFooterRender<T | null> | FooterOptions | false;
}
