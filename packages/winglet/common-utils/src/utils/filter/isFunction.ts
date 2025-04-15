import type { Fn } from '@aileron/declare';

export const isFunction = <T extends Fn<any[], any>>(
  value: unknown,
): value is T => typeof value === 'function';
