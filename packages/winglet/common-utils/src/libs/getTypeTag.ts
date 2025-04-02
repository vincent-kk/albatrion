import { NULL_TAG, UNDEFINED_TAG } from '@/common-utils/constant/typeTag';

export const getTypeTag = <Type>(value: Type): string => {
  if (value === null) return NULL_TAG;
  if (value === undefined) return UNDEFINED_TAG;
  return Object.prototype.toString.call(value);
};
