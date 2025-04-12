import { isArray } from '@winglet/common-utils';

export const parseArray = <T>(value: unknown): T[] =>
  isArray(value) ? value : [];
