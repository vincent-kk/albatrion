import { isPlainObject } from '@winglet/common-utils';

import type { ObjectValue } from '@/schema-form/types';

/**
 * 입력값을 배열 형식으로 분석합니다.
 * @param value - 분석할 값
 * @returns 분석된 배열 또는 배열이 아닌 경우 빈 배열
 * @typeParam T - 배열 요소의 타입
 */
export const parseObject = (value: unknown): ObjectValue =>
  isPlainObject(value) ? value : {};
