import { NULL_TAG, UNDEFINED_TAG } from '@/common-utils/constant/typeTag';

/**
 * Function to get the internal [[Class]] type tag of a value
 * This type tag is used to identify the specific type of an object
 * @template Type - Type of the value to check
 * @param value - Value to get the type tag for
 * @returns Type tag string of the value (e.g. '[object Array]')
 */
export const getTypeTag = <Type>(value: Type): string => {
  if (value === null) return NULL_TAG;
  if (value === undefined) return UNDEFINED_TAG;
  return Object.prototype.toString.call(value);
};
