import { NULL_TAG, UNDEFINED_TAG } from '@/common-utils/constant/typeTag';

/**
 * 값의 내부 [[Class]] 타입 태그를 가져오는 함수
 * 이 타입 태그는 객체의 구체적인 종류를 식별하는 데 사용됨
 * @template Type - 확인할 값의 타입
 * @param value - 타입 태그를 가져올 값
 * @returns 값의 타입 태그 문자열 (e.g. '[object Array]')
 */
export const getTypeTag = <Type>(value: Type): string => {
  if (value === null) return NULL_TAG;
  if (value === undefined) return UNDEFINED_TAG;
  return Object.prototype.toString.call(value);
};
