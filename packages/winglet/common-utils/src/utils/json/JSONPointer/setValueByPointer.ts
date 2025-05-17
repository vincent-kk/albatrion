import type { Dictionary } from '@aileron/declare';

import { isArray } from '@/common-utils/utils/filter/isArray';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

import { compilePointer } from './utils/compileSegments';
import { JSONPointerError } from './utils/error';
import { setValue } from './utils/setValue';

/**
 * JSON 포인터를 사용하여 객체의 특정 위치에 값을 설정하는 함수
 * RFC 6901 규격에 따른 JSON 포인터를 지원함
 *
 * @template Input - 입력 객체 타입
 * @param input - 값을 설정할 대상 객체
 * @param pointer - JSON 포인터 (문자열 또는 문자열 배열)
 * @param value - 설정할 값
 * @returns 변경된 객체
 * @throws {JSONPointerError} 입력이 유효하지 않거나 포인터가 유효하지 않은 경우
 */
export const setValueByPointer = <Input extends Dictionary>(
  input: Input,
  pointer: string | string[],
  value: any,
  overwrite: boolean = true,
): Dictionary => {
  if (!(isPlainObject(input) || isArray(input)))
    throw new JSONPointerError(
      'INVALID_INPUT',
      '`input` must be a plain object or an array.',
      { input },
    );
  return setValue(input, compilePointer(pointer), value, overwrite);
};
