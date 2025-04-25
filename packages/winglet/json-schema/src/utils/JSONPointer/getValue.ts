import { Dictionary } from '@aileron/declare';

import { JSONPointer, TILDE } from './enum';
import { unescape } from './utils/unescape';

const ROOT_CHILD = JSONPointer.Root + JSONPointer.Child;

/**
 * JsonPointer를 사용하여 Schema에서 subSchema를 추출합니다.
 *
 * @example
 * ```ts
 * const schema = {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string' }
 *   }
 * };
 *
 * const subSchema = getSubSchema(schema, '/properties/name');
 * // 결과: { type: 'string' }
 * ```
 *
 * @param value - 원본 JSON Schema
 * @param pointer - JSON Pointer 문자열 (예: '/properties/name')
 * @returns 찾은 subSchema 또는 undefined
 */
export const getValue = <Value extends Dictionary>(
  value: Value,
  pointer: string,
): Dictionary | undefined => {
  if (!pointer || pointer === '') return value;
  if (pointer === JSONPointer.Root) return value;

  let startIndex = 0;
  if (pointer.startsWith(ROOT_CHILD)) startIndex = ROOT_CHILD.length;
  else if (pointer.startsWith(JSONPointer.Child))
    startIndex = JSONPointer.Child.length;

  let current = value;
  let keyStart = startIndex;
  let i = startIndex;

  while (i < pointer.length) {
    if (!current) return undefined;
    if (pointer[i] === JSONPointer.Child) {
      if (i > keyStart) {
        const key =
          pointer.indexOf(TILDE, keyStart) >= 0
            ? unescape(pointer, keyStart, i)
            : pointer.slice(keyStart, i);
        current = current[key];
      }
      keyStart = i + 1;
    }
    i++;
  }

  if (keyStart < pointer.length) {
    const key =
      pointer.indexOf(TILDE, keyStart) >= 0
        ? unescape(pointer, keyStart, pointer.length)
        : pointer.slice(keyStart);
    current = current[key];
  }

  return current;
};
