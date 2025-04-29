import { hasOwnProperty } from '@/common-utils/libs/hasOwnProperty';

/**
 * 두 값이 깊은 수준까지 동일한지 비교합니다. (최적화 버전)
 * 객체와 배열의 내용을 반복적으로 비교하며, NaN === NaN 도 true로 처리합니다.
 * @param leftOperand 비교할 첫 번째 값
 * @param rightOperand 비교할 두 번째 값
 * @returns 두 값이 동일하면 true, 그렇지 않으면 false
 */

export const equals = (
  left: unknown,
  right: unknown,
  omit?: Set<PropertyKey> | Array<PropertyKey>,
): boolean => {
  const omits = omit ? (omit instanceof Set ? omit : new Set(omit)) : null;
  return equalsRecursive(left, right, omits);
};

const equalsRecursive = (
  left: unknown,
  right: unknown,
  omits: Set<PropertyKey> | null,
): boolean => {
  if (left === right || (left !== left && right !== right)) return true;

  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  )
    return false;

  const leftIsArray = Array.isArray(left);
  const rightIsArray = Array.isArray(right);

  if (leftIsArray !== rightIsArray) return false;

  if (leftIsArray && rightIsArray) {
    const length = left.length;
    if (length !== right.length) return false;
    for (let index = 0; index < length; index++)
      if (!equalsRecursive(left[index], right[index], omits)) return false;
    return true;
  }

  const keys = Object.keys(left);
  const length = keys.length;

  if (length !== Object.keys(right).length) return false;

  for (let index = 0; index < length; index++) {
    const key = keys[index];
    if (omits?.has(key)) continue;
    if (
      !hasOwnProperty(right, key) ||
      !equalsRecursive((left as any)[key], (right as any)[key], omits)
    )
      return false;
  }

  return true;
};
