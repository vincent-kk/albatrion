import { getObjectKeys } from './getObjectKeys';
import { serializeNative } from './serializeNative';

/**
 * 객체를 직렬화된 문자열로 변환합니다.
 *
 * @param object - 직렬화할 객체
 * @param omits - 직렬화에서 제외할 속성 키 배열 (선택사항)
 * @returns 직렬화된 문자열 ('key:value' 형태로 '|'로 구분)
 *
 * @example
 * serializeObject({a: 1, b: 2}); // 'a:1|b:2'
 * serializeObject({a: 1, b: 2, c: 3}, ['b']); // 'a:1|c:3'
 */
export const serializeObject = (object: any, omits?: string[]): string => {
  if (!object || typeof object !== 'object') return serializeNative(object);
  const keys = getObjectKeys(object, omits) as string[];
  const segments = new Array(keys.length);
  let key = keys.pop();
  let index = 0;
  while (key) {
    segments[index++] =
      `${key}:${typeof object[key] === 'object' ? serializeNative(object[key]) : object[key]}`;
    key = keys.pop();
  }
  return segments.join('|');
};
