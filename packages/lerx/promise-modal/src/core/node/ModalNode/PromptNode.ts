import type { ComponentType, ReactNode } from 'react';

import type {
  FooterOptions,
  ManagedEntity,
  PromptContentProps,
  PromptFooterRender,
  PromptInputProps,
  PromptModal,
} from '@/promise-modal/types';

import { BaseNode } from './AbstractBaseNode';

type PromptNodeProps<T, B> = PromptModal<T, B> & ManagedEntity;

export class PromptNode<T, B> extends BaseNode<T, B> {
  readonly type: 'prompt';
  readonly content?: ReactNode | ComponentType<PromptContentProps>;
  readonly defaultValue: T | undefined;
  readonly Input: (props: PromptInputProps<T>) => ReactNode;
  readonly disabled?: (value: T) => boolean;
  readonly returnOnCancel?: boolean;
  readonly footer?: PromptFooterRender<T> | FooterOptions | false;
  #value: T | undefined;

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
    this.#value = defaultValue;
    this.disabled = disabled;
    this.returnOnCancel = returnOnCancel;
    this.footer = footer;
  }

  onChange(value: T) {
    this.#value = value;
  }
  onConfirm() {
    this.resolve(this.#value ?? null);
  }
  onClose() {
    if (this.returnOnCancel) this.resolve(this.#value ?? null);
    else this.resolve(null);
  }
}
