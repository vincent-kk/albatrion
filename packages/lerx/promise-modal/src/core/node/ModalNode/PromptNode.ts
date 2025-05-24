import type { ComponentType, ReactNode } from 'react';

import type {
  FooterOptions,
  ManagedEntity,
  PromptContentProps,
  PromptFooterRender,
  PromptInputProps,
  PromptModal,
} from '@/promise-modal/types';

import { AbstractNode } from './AbstractNode';

type PromptNodeProps<T, B> = PromptModal<T, B> & ManagedEntity;

export class PromptNode<T, B> extends AbstractNode<T, B> {
  readonly type: 'prompt';
  readonly content?: ReactNode | ComponentType<PromptContentProps>;
  readonly defaultValue: T | undefined;
  readonly Input: (props: PromptInputProps<T>) => ReactNode;
  readonly disabled?: (value: T) => boolean;
  readonly returnOnCancel?: boolean;
  readonly footer?: PromptFooterRender<T> | FooterOptions | false;
  private __value__: T | undefined;

  constructor({
    id,
    initiator,
    type,
    title,
    subtitle,
    content,
    defaultValue,
    Input,
    disabled,
    returnOnCancel,
    footer,
    background,
    dimmed,
    manualDestroy,
    closeOnBackdropClick,
    resolve,
    ForegroundComponent,
    BackgroundComponent,
  }: PromptNodeProps<T, B>) {
    super({
      id,
      initiator,
      title,
      subtitle,
      background,
      dimmed,
      manualDestroy,
      closeOnBackdropClick,
      resolve,
      ForegroundComponent,
      BackgroundComponent,
    });
    this.type = type;
    this.content = content;
    this.Input = Input;
    this.defaultValue = defaultValue;
    this.__value__ = defaultValue;
    this.disabled = disabled;
    this.returnOnCancel = returnOnCancel;
    this.footer = footer;
  }

  onChange(value: T) {
    this.__value__ = value;
  }
  onConfirm() {
    this.resolve(this.__value__ ?? null);
  }
  onClose() {
    if (this.returnOnCancel) this.resolve(this.__value__ ?? null);
    else this.resolve(null);
  }
}
