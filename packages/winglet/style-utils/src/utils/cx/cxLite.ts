import type { ClassValue } from './type';

export const cxLite = (...args: ClassValue[]): string => {
  let index = 0,
    length = args.length,
    cursor: any,
    result = '';
  for (; index < length; index++)
    if ((cursor = args[index]))
      result = result ? result + ' ' + cursor : cursor;
  return result;
};
