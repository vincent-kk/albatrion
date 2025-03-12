import type { Fn } from '@aileron/types';

export const isFunction = <T extends Fn<any[], any> = Fn<any[], any>>(
  content: unknown,
): content is T => typeof content === 'function';
