import { getKeys } from '@/common-utils/libs';

/**
 * 값이나 그 내부에 undefined가 있는지 깊이 있게 검사합니다.
 * 객체와 배열의 모든 중첩 레벨을 순회하며 undefined 값을 찾습니다.
 *
 * @param value - 검사할 값
 * @returns 값 자체가 undefined이거나 내부에 undefined가 포함되어 있으면 true, 그렇지 않으면 false
 *
 * @example
 * hasUndefined(undefined); // true
 * hasUndefined({ a: 1, b: undefined }); // true
 * hasUndefined({ a: 1, b: { c: undefined } }); // true
 * hasUndefined({ a: 1, b: 2 }); // false
 * hasUndefined([1, 2, undefined]); // true
 */
export const hasUndefined = (value: any): boolean => {
  if (value === undefined) return true;

  const stack: any[] = [value];
  while (stack.length > 0) {
    const current = stack.pop();

    if (current === undefined) return true;
    if (current === null || typeof current !== 'object') continue;

    if (Array.isArray(current)) {
      for (let i = 0, len = current.length; i < len; i++)
        stack.push(current[i]);
    } else {
      const keys = getKeys(current);
      for (let i = 0, len = keys.length; i < len; i++)
        stack.push(current[keys[i]]);
    }
  }

  return false;
};
