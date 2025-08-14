import type { Fn } from '@aileron/declare';

export interface SchedulerOptions {
  readonly maxPendingTasks?: number;
  readonly onTaskError?: Fn<[error: Error, taskId: number]> | null;
  readonly onMaxTasksExceeded?: Fn<[], boolean | void> | null; // Return false to prevent scheduling
}
