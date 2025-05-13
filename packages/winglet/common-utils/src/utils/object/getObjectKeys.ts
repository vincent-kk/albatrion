import type { Dictionary, Fn } from '@aileron/declare';

/**
 * 객체의 키 배열을 반환합니다.
 *
 * @template Type - 딕셔너리 타입의 객체
 * @param object - 키를 추출할 객체
 * @param omit - 제외할 키의 집합 또는 배열 (선택사항)
 * @param sort - 키 정렬에 사용할 비교 함수 (선택사항)
 * @returns 객체의 키 배열
 *
 * @example
 * // 모든 키 가져오기
 * getObjectKeys({a: 1, b: 2, c: 3}); // ['a', 'b', 'c']
 *
 * // 특정 키 제외하기
 * getObjectKeys({a: 1, b: 2, c: 3}, ['b']); // ['a', 'c']
 *
 * // 키 정렬하기
 * getObjectKeys({c: 3, a: 1, b: 2}, undefined, (a, b) => a.localeCompare(b)); // ['a', 'b', 'c']
 */
export const getObjectKeys = <Type extends Dictionary>(
  object: Type | undefined,
  omit?: Set<keyof Type> | Array<keyof Type>,
  sort?: Fn<[a: keyof Type, b: keyof Type], number>,
): Array<keyof Type> => {
  if (!object) return [];
  let keys: Array<keyof Type> = Object.keys(object);

  if (omit) {
    const omits = omit instanceof Set ? omit : new Set(omit);
    const filteredKeys: Array<keyof Type> = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!omits.has(key)) filteredKeys[filteredKeys.length] = key;
    }
    keys = filteredKeys;
  }

  if (sort) keys = keys.sort(sort);

  return keys;
};
