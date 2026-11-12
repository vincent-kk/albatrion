import type { ReactNode } from 'react';

import type { Fn } from '@aileron/declare';

import { normalizeDuration } from '@/promise-modal/helpers/normalizeDuration';
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
  /** Styling variant preserved independently of modal kind. */
  readonly subtype?: 'info' | 'success' | 'warning' | 'error';
  /** Stack position assigned by the manager. */
  order = 0;
  /** Monotonic snapshot for external-store subscriptions. */
  version = 0;
  /** Whether the request already has a result or error. */
  private __settled__ = false;
  /** Reports whether a result or rendering error is final. */
  get settled() {
    return this.__settled__;
  }
  /** Error settlement callback carried through queued requests. */
  private __handleReject__?: Fn<[error: unknown]>;
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

  private __alive__: boolean;
  get alive() {
    return this.__alive__;
  }

  private __visible__: boolean;
  get visible() {
    return this.__visible__;
  }

  private __handleResolve__?: Fn<[result: T | undefined | null]>;
  set handleResolve(handleResolve: Fn<[result: T | undefined | null]>) {
    this.__handleResolve__ = handleResolve;
  }

  private __listeners__: Set<Fn> = new Set();

  constructor({
    id,
    initiator,
    group,
    subtype,
    title,
    subtitle,
    background,
    dimmed = true,
    duration = 0,
    manualDestroy = false,
    closeOnBackdropClick = true,
    handleResolve,
    handleReject,
    ForegroundComponent,
    BackgroundComponent,
  }: AbstractNodeProps<T, B>) {
    this.id = id;
    this.group = group;
    this.subtype = subtype;
    this.initiator = initiator;
    this.title = title;
    this.subtitle = subtitle;
    this.background = background;

    this.dimmed = dimmed;
    this.duration = parseFloat(normalizeDuration(duration, '0ms'));
    this.manualDestroy = manualDestroy;
    this.closeOnBackdropClick = closeOnBackdropClick;

    this.ForegroundComponent = ForegroundComponent;
    this.BackgroundComponent = BackgroundComponent;

    this.__alive__ = true;
    this.__visible__ = true;
    this.__handleResolve__ = handleResolve;
    this.__handleReject__ = handleReject;
  }

  abstract onClose(): void;
  abstract onConfirm(): void;

  /** Commits the first result and publishes the settled transition. */
  protected onResolve(result: T | undefined | null) {
    if (this.__settled__) return;
    this.__settled__ = true;
    this.__handleResolve__?.(result);
    this.publish();
  }

  /** Rejects an uncompleted request with its rendering error. */
  onReject(error: unknown) {
    if (this.__settled__) return;
    this.__settled__ = true;
    this.__handleReject__?.(error);
    this.publish();
  }

  subscribe(listener: Fn) {
    this.__listeners__.add(listener);
    return () => {
      this.__listeners__.delete(listener);
    };
  }

  /** Advances the subscription snapshot before notifying listeners. */
  publish() {
    this.version++;
    for (const listener of this.__listeners__) listener();
  }

  /** Cancels an unfinished request and publishes removal regardless of destroy mode. */
  onDestroy() {
    if (!this.settled) this.onClose();
    const needPublish = this.__alive__ || this.__visible__;
    this.__alive__ = false;
    this.__visible__ = false;
    if (needPublish) this.publish();
  }

  /** Restores route visibility only while the request remains alive and pending. */
  onShow() {
    if (this.settled || !this.alive) return;
    const needPublish = this.__visible__ === false;
    this.__visible__ = true;
    if (needPublish) this.publish();
  }

  onHide() {
    const needPublish = this.__visible__ === true;
    this.__visible__ = false;
    if (needPublish) this.publish();
  }
}
