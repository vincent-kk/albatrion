import type { Fn } from '@aileron/types';

export const isFunction = <T extends Fn<any[], any> = Fn<any[], any>>(
  value: unknown,
): value is T => typeof value === 'function';
