import type { Dictionary } from '@aileron/declare';

import { isArray } from '@/common-utils/utils/filter/isArray';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

import { compilePointer } from './utils/compileSegments';
import { JSONPointerError } from './utils/error';
import { getValue } from './utils/getValue';

/**
 * JSON 포인터를 사용하여 객체에서 값을 추출하는 함수
 * RFC 6901 규격에 따른 JSON 포인터를 지원함
 *
 * @template Input - 입력 객체 타입
 * @param input - 값을 추출할 대상 객체
 * @param pointer - JSON 포인터 (문자열 또는 문자열 배열)
 * @returns 포인터가 가리키는 값
 * @throws {JSONPointerError} 입력이 유효하지 않거나 포인터를 찾을 수 없는 경우
 */
export const getValueByPointer = <Input extends Dictionary>(
  input: Input,
  pointer: string | string[],
): any => {
  if (!(isPlainObject(input) || isArray(input)))
    throw new JSONPointerError(
      'INVALID_INPUT',
      '`input` must be a plain object or an array.',
      { input },
    );
  return getValue(input, compilePointer(pointer));
};
