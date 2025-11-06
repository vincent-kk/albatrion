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
  readonly group?: string;
  readonly initiator: string;

  readonly title?: ReactNode;
  readonly subtitle?: ReactNode;
  readonly background?: ModalBackground<B>;

  readonly dimmed: boolean;
  readonly duration: number;
  readonly manualDestroy: boolean;
  readonly closeOnBackdropClick: boolean;

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

  #handleResolve?: Fn<[result: T | null]>;
  set handleResolve(handleResolve: Fn<[result: T | null]>) {
    this.#handleResolve = handleResolve;
  }

  #listeners: Set<Fn> = new Set();

  constructor({
    id,
    initiator,
    group,
    title,
    subtitle,
    background,
    dimmed = true,
    duration = 0,
    manualDestroy = false,
    closeOnBackdropClick = true,
    handleResolve,
    ForegroundComponent,
    BackgroundComponent,
  }: AbstractNodeProps<T, B>) {
    this.id = id;
    this.group = group;
    this.initiator = initiator;
    this.title = title;
    this.subtitle = subtitle;
    this.background = background;

    this.dimmed = dimmed;
    this.duration = duration;
    this.manualDestroy = manualDestroy;
    this.closeOnBackdropClick = closeOnBackdropClick;

    this.ForegroundComponent = ForegroundComponent;
    this.BackgroundComponent = BackgroundComponent;

    this.#alive = true;
    this.#visible = true;
    this.#handleResolve = handleResolve;
  }

  abstract onClose(): void;
  abstract onConfirm(): void;

  protected onResolve(result: T | null) {
    this.#handleResolve?.(result);
  }

  subscribe(listener: Fn) {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  publish() {
    for (const listener of this.#listeners) listener();
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
}
