import type { ReactNode } from 'react';

import type { Fn } from '@aileron/declare';

import type {
  BackgroundComponent,
  BaseModal,
  ForegroundComponent,
  ManagedEntity,
  ModalBackground,
} from '@/promise-modal/types';

type AbstractNodeProps<T, B> = BaseModal<T, B> & ManagedEntity;

export abstract class AbstractNode<T, B> {
  readonly id: number;
  readonly initiator: string;

  readonly title?: ReactNode;
  readonly subtitle?: ReactNode;
  readonly background?: ModalBackground<B>;

  readonly manualDestroy: boolean;
  readonly closeOnBackdropClick: boolean;
  readonly dimmed: boolean;

  readonly ForegroundComponent?: ForegroundComponent;
  readonly BackgroundComponent?: BackgroundComponent;

  private __alive__: boolean;
  get alive() {
    return this.__alive__;
  }
  private __visible__: boolean;
  get visible() {
    return this.__visible__;
  }

  private __resolve__: (result: T | null) => void;
  private __listeners__: Set<Fn> = new Set();

  constructor({
    id,
    initiator,
    title,
    subtitle,
    background,
    dimmed = true,
    manualDestroy = false,
    closeOnBackdropClick = true,
    resolve,
    ForegroundComponent,
    BackgroundComponent,
  }: AbstractNodeProps<T, B>) {
    this.id = id;
    this.initiator = initiator;
    this.title = title;
    this.subtitle = subtitle;
    this.background = background;

    this.dimmed = dimmed;
    this.manualDestroy = manualDestroy;
    this.closeOnBackdropClick = closeOnBackdropClick;

    this.ForegroundComponent = ForegroundComponent;
    this.BackgroundComponent = BackgroundComponent;

    this.__alive__ = true;
    this.__visible__ = true;
    this.__resolve__ = resolve;
  }

  subscribe(listener: Fn) {
    this.__listeners__.add(listener);
    return () => {
      this.__listeners__.delete(listener);
    };
  }
  publish() {
    for (const listener of this.__listeners__) listener();
  }
  protected resolve(result: T | null) {
    this.__resolve__(result);
  }
  onDestroy() {
    const needPublish = this.__alive__ === true;
    this.__alive__ = false;
    if (this.manualDestroy && needPublish) this.publish();
  }
  onShow() {
    const needPublish = this.__visible__ === false;
    this.__visible__ = true;
    if (needPublish) this.publish();
  }
  onHide() {
    const needPublish = this.__visible__ === true;
    this.__visible__ = false;
    if (needPublish) this.publish();
  }
  abstract onClose(): void;
  abstract onConfirm(): void;
}
