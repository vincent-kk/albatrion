/**
 * 두 값이 깊은 수준까지 동일한지 비교합니다. (재귀 최적화 + 안정성 버전)
 * 객체와 배열의 내용을 반복적으로 비교하며, NaN === NaN 도 true로 처리합니다.
 * 순환 참조, Date, RegExp, TypedArray, Symbol 키, 희소 배열 등을 처리합니다.
 * Set과 Map은 현재 참조 동일성만 비교합니다. (추후 값 비교로 확장 가능)
 * @param leftOperand 비교할 첫 번째 값
 * @param rightOperand 비교할 두 번째 값
 * @returns 두 값이 동일하면 true, 그렇지 않으면 false
 */
export const stableEquals = (
  leftOperand: unknown,
  rightOperand: unknown,
): boolean => {
  const visited = new WeakMap<object, Set<object>>();
  return stableEqualsRecursive(leftOperand, rightOperand, visited);
};

const stableEqualsRecursive = (
  left: unknown,
  right: unknown,
  visited: WeakMap<object, Set<object>>,
): boolean => {
  if (left === right || (left !== left && right !== right)) return true;

  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  )
    return false;

  if (visited.has(left) && visited.get(left)!.has(right)) return true;

  if (!visited.has(left)) visited.set(left, new Set());
  visited.get(left)!.add(right);
  if (!visited.has(right)) visited.set(right, new Set());
  visited.get(right)!.add(left);

  if (left instanceof Date && right instanceof Date)
    return left.getTime() === right.getTime();

  if (left instanceof RegExp && right instanceof RegExp)
    return left.source === right.source && left.flags === right.flags;

  if (ArrayBuffer.isView(left) && ArrayBuffer.isView(right)) {
    if (left.constructor !== right.constructor) return false;
    if (left.byteLength !== right.byteLength) return false;

    const viewLeft = new DataView(
      left.buffer,
      left.byteOffset,
      left.byteLength,
    );
    const viewRight = new DataView(
      right.buffer,
      right.byteOffset,
      right.byteLength,
    );
    for (let index = 0; index < left.byteLength; index++)
      if (viewLeft.getUint8(index) !== viewRight.getUint8(index)) return false;
    return true;
  }

  const leftIsArray = Array.isArray(left);
  const rightIsArray = Array.isArray(right);

  if (leftIsArray !== rightIsArray) return false;
  if (leftIsArray && rightIsArray) {
    const length = left.length;
    if (length !== right.length) return false;
    for (let index = 0; index < length; index++) {
      const leftHasIndex = index in left;
      const rightHasIndex = index in right;
      if (leftHasIndex !== rightHasIndex) return false;
      if (leftHasIndex)
        if (!stableEqualsRecursive(left[index], right[index], visited))
          return false;
    }
    return true;
  }

  const leftKeys = Reflect.ownKeys(left);

  if (leftKeys.length !== Reflect.ownKeys(right).length) return false;
  for (let index = 0; index < leftKeys.length; index++) {
    const key = leftKeys[index];
    if (!Reflect.has(right, key)) return false;
    if (
      !stableEqualsRecursive((left as any)[key], (right as any)[key], visited)
    )
      return false;
  }

  return true;
};
