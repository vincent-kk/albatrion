import type { Fn } from '@aileron/types';

export const isFunction = <Params extends Array<any>, Return>(
  content: unknown,
): content is Fn<Params, Return> => typeof content === 'function';
