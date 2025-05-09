import type { Dictionary, Nullish } from '@aileron/declare';

/**
 * 객체의 키를 지정된 순서대로 정렬합니다.
 *
 * @template Dict - 딕셔너리 타입
 * @param object - 정렬할 객체
 * @param keys - 정렬 순서를 지정하는 키 배열
 * @param omitUndefined - undefined 값을 가진 속성을 제외할지 여부 (선택사항)
 * @returns 정렬된 키를 가진 새로운 객체
 *
 * @example
 * sortObjectKeys({c: 3, a: 1, b: 2}, ['a', 'b', 'c']); // {a: 1, b: 2, c: 3}
 * sortObjectKeys({c: 3, a: 1, b: undefined}, ['a', 'b', 'c'], true); // {a: 1, c: 3}
 */
export const sortObjectKeys = <Dict extends Dictionary>(
  object: Nullish<Dict>,
  keys: string[],
  omitUndefined?: boolean,
): Dict => {
  if (!object) return {} as Dict;
  const result: Dictionary = {};
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (!(key in object) || (omitUndefined && object[key] === undefined))
      continue;
    result[key] = object[key];
  }
  const objectKeys = Object.keys(object);
  for (let index = 0; index < objectKeys.length; index++) {
    const key = objectKeys[index];
    if (key in result || (omitUndefined && object[key] === undefined)) continue;
    result[key] = object[key];
  }
  return result as Dict;
};
