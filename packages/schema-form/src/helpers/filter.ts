import type { ComponentType } from 'react';

export const isTruthy = <T>(
  value: T,
): value is Exclude<T, false | null | undefined | '' | 0> => Boolean(value);

export const isComponentType = <P>(
  content: unknown,
): content is ComponentType<P> => typeof content === 'function';

export const isFunction = <Params extends Array<any>, Return>(
  content: unknown,
): content is Fn<Params, Return> => typeof content === 'function';
