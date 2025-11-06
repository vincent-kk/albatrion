import type { ComponentType, ReactNode } from 'react';

import type { Fn } from '@aileron/declare';

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
  readonly Input: Fn<[props: PromptInputProps<T>], ReactNode>;
  readonly disabled?: Fn<[value: T], boolean>;
  readonly returnOnCancel?: boolean;
  readonly footer?: PromptFooterRender<T> | FooterOptions | false;

  #value: T | undefined;

  constructor({
    id,
    group,
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
    duration,
    manualDestroy,
    closeOnBackdropClick,
    handleResolve,
    ForegroundComponent,
    BackgroundComponent,
  }: PromptNodeProps<T, B>) {
    super({
      id,
      group,
      initiator,
      title,
      subtitle,
      background,
      dimmed,
      duration,
      manualDestroy,
      closeOnBackdropClick,
      handleResolve,
      ForegroundComponent,
      BackgroundComponent,
    });
    this.type = type;
    this.content = content;
    this.Input = Input;
    this.defaultValue = defaultValue;
    this.#value = defaultValue;
    this.disabled = disabled;
    this.returnOnCancel = returnOnCancel;
    this.footer = footer;
  }

  onChange(value: T) {
    this.#value = value;
  }

  onConfirm() {
    this.onResolve(this.#value ?? null);
  }

  onClose() {
    if (this.returnOnCancel) this.onResolve(this.#value ?? null);
    else this.onResolve(null);
  }
}
