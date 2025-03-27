import type { ReactNode } from 'react';

import type { Fn } from '@aileron/types';

import type {
  BackgroundComponent,
  BaseModal,
  ForegroundComponent,
  ManagedEntity,
  ModalBackground,
} from '@/promise-modal/types';

type BaseNodeProps<T, B> = BaseModal<T, B> & ManagedEntity;

export abstract class BaseNode<T, B> {
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

  #alive: boolean;
  get alive() {
    return this.#alive;
  }
  #visible: boolean;
  get visible() {
    return this.#visible;
  }

  #resolve: (result: T | null) => void;
  #listeners: Fn[] = [];

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
  }: BaseNodeProps<T, B>) {
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

    this.#alive = true;
    this.#visible = true;
    this.#resolve = resolve;
  }

  subscribe(listener: Fn) {
    this.#listeners.push(listener);
    return () => {
      this.#listeners = this.#listeners.filter((l) => l !== listener);
    };
  }
  publish() {
    for (const listener of this.#listeners) listener();
  }
  protected resolve(result: T | null) {
    this.#resolve(result);
  }
  onDestroy() {
    const needPublish = this.#alive === true;
    this.#alive = false;
    if (this.manualDestroy && needPublish) this.publish();
  }
  onShow() {
    const needPublish = this.#visible === false;
    this.#visible = true;
    if (needPublish) this.publish();
  }
  onHide() {
    const needPublish = this.#visible === true;
    this.#visible = false;
    if (needPublish) this.publish();
  }
  abstract onClose(): void;
  abstract onConfirm(): void;
}
