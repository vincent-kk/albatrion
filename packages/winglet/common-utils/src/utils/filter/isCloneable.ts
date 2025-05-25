import {
  ARGUMENTS_TAG,
  ARRAY_BUFFER_TAG,
  ARRAY_TAG,
  BOOLEAN_TAG,
  DATA_VIEW_TAG,
  DATE_TAG,
  FLOAT_32_ARRAY_TAG,
  FLOAT_64_ARRAY_TAG,
  INT_8_ARRAY_TAG,
  INT_16_ARRAY_TAG,
  INT_32_ARRAY_TAG,
  MAP_TAG,
  NUMBER_TAG,
  OBJECT_TAG,
  REGEXP_TAG,
  SET_TAG,
  STRING_TAG,
  SYMBOL_TAG,
  UINT_8_ARRAY_TAG,
  UINT_8_CLAMPED_ARRAY_TAG,
  UINT_16_ARRAY_TAG,
  UINT_32_ARRAY_TAG,
} from '@/common-utils/constant/typeTag';
import { getTypeTag } from '@/common-utils/libs/getTypeTag';

/**
 * Set of cloneable type tags
 */
const CLONEABLE_TAGS = new Set([
  ARGUMENTS_TAG,
  ARRAY_TAG,
  ARRAY_BUFFER_TAG,
  DATA_VIEW_TAG,
  BOOLEAN_TAG,
  DATE_TAG,
  FLOAT_32_ARRAY_TAG,
  FLOAT_64_ARRAY_TAG,
  INT_8_ARRAY_TAG,
  INT_16_ARRAY_TAG,
  INT_32_ARRAY_TAG,
  MAP_TAG,
  NUMBER_TAG,
  OBJECT_TAG,
  REGEXP_TAG,
  SET_TAG,
  STRING_TAG,
  SYMBOL_TAG,
  UINT_8_ARRAY_TAG,
  UINT_8_CLAMPED_ARRAY_TAG,
  UINT_16_ARRAY_TAG,
  UINT_32_ARRAY_TAG,
]);

/**
 * Function to check if an object is a cloneable type
 * Cloneable types include arrays, objects, data structures, etc.
 * @param object - Object or value to check
 * @returns true if it's a cloneable type, false otherwise
 */
export const isCloneable = (object: unknown): boolean =>
  CLONEABLE_TAGS.has(getTypeTag(object));
