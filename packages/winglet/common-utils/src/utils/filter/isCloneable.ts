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

let cloneableTags: Set<string>;

export const isCloneable = (object: unknown): boolean => {
  if (!cloneableTags) {
    cloneableTags = new Set([
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
  }
  return cloneableTags.has(getTypeTag(object));
};
