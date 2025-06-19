import type { ClassValue } from './type';

export const cx = (...args: ClassValue[]): string => {
  let index = 0,
    length = args.length,
    cursor: any,
    result = '';
  for (; index < length; index++) {
    if ((cursor = args[index]) && (cursor = getSegment(cursor))) {
      result = result ? result + ' ' + cursor : cursor;
    }
  }
  return result;
};

const getSegment = (input: ClassValue): string => {
  let key: any,
    cursor: any,
    result = '';
  if (typeof input === 'string' || typeof input === 'number')
    return result + input;
  else if (typeof input === 'object' && input) {
    if (Array.isArray(input)) {
      for (key = 0; key < input.length; key++)
        if ((cursor = input[key]) && (cursor = getSegment(cursor)))
          result = result ? result + ' ' + cursor : cursor;
    } else {
      for (cursor in input)
        if (input[cursor]) result = result ? result + ' ' + cursor : cursor;
    }
  }
  return result;
};
