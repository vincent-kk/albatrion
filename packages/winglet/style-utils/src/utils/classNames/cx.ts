import { classNames } from './classNames';
import type { ClassNamesOptions, ClassValue } from './type';

const defaultOptions: ClassNamesOptions = {
  removeDuplicates: false,
  normalizeWhitespace: false,
  filterEmpty: true,
};

export const cx = (...args: ClassValue[]): string =>
  classNames(args, defaultOptions);
