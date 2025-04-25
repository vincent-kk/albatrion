import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JSONPointer } from '../JSONPointer';

const ROOT_CHILD = JSONPointer.Root + JSONPointer.Child;
const ROOT = JSONPointer.Root;
const CHILD = JSONPointer.Child;
const TILDE = '~';

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
 * @param schema - 원본 JSON Schema
 * @param pointer - JSON Pointer 문자열 (예: '/properties/name')
 * @returns 찾은 subSchema 또는 undefined
 */
export const findSchemaByPointer = (
  schema: UnknownSchema,
  pointer: string,
): UnknownSchema | undefined => {
  if (!pointer || pointer === '') return schema;
  if (pointer === ROOT) return schema;

  let startIndex = 0;
  if (pointer.startsWith(ROOT_CHILD)) startIndex = ROOT_CHILD.length;
  else if (pointer.startsWith(CHILD)) startIndex = CHILD.length;

  let current = schema;
  let keyStart = startIndex;
  let i = startIndex;

  while (i < pointer.length) {
    if (!current) return undefined;
    if (pointer[i] === CHILD) {
      if (i > keyStart) {
        const key =
          pointer.indexOf(TILDE, keyStart) >= 0
            ? unescapeJSONPointer(pointer, keyStart, i)
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
        ? unescapeJSONPointer(pointer, keyStart, pointer.length)
        : pointer.slice(keyStart);
    current = current[key];
  }

  return current;
};

/**
 * JSON Pointer 이스케이프 문자를 원래 문자로 변환합니다.
 * 최적화: 이스케이프된 문자가 있는 경우에만 변환 작업을 수행합니다.
 */
const unescapeJSONPointer = (
  str: string,
  start: number,
  end: number,
): string => {
  const len = end - start;
  const chars: string[] = new Array(len);
  let writeIndex = 0;
  for (let i = start; i < end; i++) {
    const char = str[i];
    if (char === TILDE) {
      const nextChar = str[i + 1];
      if (nextChar === '1') {
        chars[writeIndex++] = '/';
        i++;
      } else if (nextChar === '0') {
        chars[writeIndex++] = TILDE;
        i++;
      } else {
        chars[writeIndex++] = char;
      }
    } else {
      chars[writeIndex++] = char;
    }
  }
  return chars.slice(0, writeIndex).join('');
};
