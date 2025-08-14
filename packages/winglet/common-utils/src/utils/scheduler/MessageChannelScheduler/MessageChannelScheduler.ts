import type { Fn } from '@aileron/declare';

import { scheduleMicrotask } from '../scheduleMicrotask';
import type { SchedulerOptions } from './type';

export class MessageChannelScheduler {
  private static __instance__: MessageChannelScheduler | null = null;
  private readonly __options__: Required<SchedulerOptions>;
  private __destroyed__ = false;

  private readonly __channel__: MessageChannel;
  private readonly __receiverPort__: MessagePort;
  private readonly __senderPort__: MessagePort;

  private readonly __pendingTasks__ = new Map<number, Fn>();
  private __taskIdCounter__ = 0;
  private __idle__ = true;

  private constructor(options: SchedulerOptions = {}) {
    this.__options__ = {
      maxPendingTasks: options.maxPendingTasks ?? Infinity,
      onTaskError: options.onTaskError ?? null,
      onMaxTasksExceeded: options.onMaxTasksExceeded ?? null,
    };
    this.__channel__ = new MessageChannel();
    this.__receiverPort__ = this.__channel__.port1;
    this.__senderPort__ = this.__channel__.port2;
    this.__receiverPort__.onmessage = this.__createMessageHandler__();
  }

  static getInstance(options?: SchedulerOptions): MessageChannelScheduler {
    const instance = MessageChannelScheduler.__instance__;
    if (instance && !instance.__destroyed__) return instance;
    MessageChannelScheduler.__instance__ = new MessageChannelScheduler(options);
    return MessageChannelScheduler.__instance__;
  }

  schedule(callback: Fn): number {
    if (this.__destroyed__) throw new Error('Scheduler destroyed');
    const pendingTasks = this.__pendingTasks__;
    const maxTasks = this.__options__.maxPendingTasks;
    if (pendingTasks.size >= maxTasks) {
      const maxTasksHandler = this.__options__.onMaxTasksExceeded;
      if (maxTasksHandler) {
        const shouldContinue = maxTasksHandler();
        if (shouldContinue === false) return -1;
      } else throw new Error(`Max tasks exceeded: ${maxTasks}`);
    }
    const taskId = ++this.__taskIdCounter__;
    pendingTasks.set(taskId, callback);
    if (this.__idle__) {
      this.__idle__ = false;
      scheduleMicrotask(() => this.__flushBatch__());
    }
    return taskId;
  }

  cancel(taskId: number): boolean {
    return this.__pendingTasks__.delete(taskId);
  }

  cancelAll(): number {
    const cancelledCount = this.__pendingTasks__.size;
    this.__pendingTasks__.clear();
    this.__idle__ = true;
    return cancelledCount;
  }

  private __flushBatch__(): void {
    if (this.__pendingTasks__.size === 0) return;
    this.__senderPort__.postMessage(Array.from(this.__pendingTasks__.keys()));
  }

  isPending(taskId: number): boolean {
    return taskId > 0 && this.__pendingTasks__.has(taskId);
  }

  getPendingCount(): number {
    return this.__pendingTasks__.size;
  }

  destroy(): void {
    if (this.__destroyed__) return;
    this.__pendingTasks__.clear();
    this.__receiverPort__.onmessage = null;
    this.__receiverPort__.close();
    this.__senderPort__.close();
    this.__destroyed__ = true;
    this.__idle__ = true;
    if (MessageChannelScheduler.__instance__ === this)
      MessageChannelScheduler.__instance__ = null;
  }

  get destroyed(): boolean {
    return this.__destroyed__;
  }

  private __createMessageHandler__(): (event: MessageEvent<number[]>) => void {
    const pendingTasks = this.__pendingTasks__;
    return (event: MessageEvent<number[]>) => {
      const taskIds = event.data;
      for (let i = 0, l = taskIds.length; i < l; i++) {
        const taskId = taskIds[i];
        const task = pendingTasks.get(taskId);
        pendingTasks.delete(taskId);
        if (typeof task !== 'function') continue;
        try {
          task();
        } catch (error) {
          this.__handleTaskError__(error, taskId);
        }
      }
      pendingTasks.clear();
      this.__idle__ = true;
    };
  }

  private __handleTaskError__(error: unknown, taskId: number): void {
    const errorHandler = this.__options__.onTaskError;
    if (!errorHandler) return;
    errorHandler(
      error instanceof Error ? error : new Error(String(error)),
      taskId,
    );
  }
}
