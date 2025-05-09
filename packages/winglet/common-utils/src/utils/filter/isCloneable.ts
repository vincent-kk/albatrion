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
 * 복제 가능한 타입 태그의 집합
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
 * 객체가 복제 가능한 타입인지 확인하는 함수
 * 복제 가능한 타입에는 배열, 객체, 데이터 구조 등이 포함됨
 * @param object - 확인할 객체 또는 값
 * @returns 복제 가능한 타입이면 true, 아니면 false
 */
export const isCloneable = (object: unknown): boolean =>
  CLONEABLE_TAGS.has(getTypeTag(object));
