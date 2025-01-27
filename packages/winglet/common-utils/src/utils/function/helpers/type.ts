import type { Fn } from '@aileron/types';

export const ExecutionPolicy = {
  Leading: 'leading',
  Trailing: 'trailing',
} as const;

export type ExecutionPolicy =
  (typeof ExecutionPolicy)[keyof typeof ExecutionPolicy];

export type ExecutionOptions = {
  signal?: AbortSignal;
  policy?: Array<ExecutionPolicy>;
};

export interface ExecutionContext<F extends Fn<any[]>> {
  self: any;
  args: Parameters<F> | null;
}
