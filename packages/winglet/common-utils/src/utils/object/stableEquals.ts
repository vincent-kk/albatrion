/**
 * Compares two values for deep equality. (Recursion optimized + stability version)
 * Recursively compares the contents of objects and arrays, and also treats NaN === NaN as true.
 * Handles circular references, Date, RegExp, TypedArray, Symbol keys, sparse arrays, etc.
 * Set and Map currently only compare reference equality. (Can be extended to value comparison later)
 *
 * @param left - First value to compare
 * @param right - Second value to compare
 * @param omit - Array of property keys to exclude from comparison (optional)
 * @returns true if the two values are equal, false otherwise
 *
 * @example
 * stableEquals({a: 1, b: 2}, {a: 1, b: 2}); // true
 * stableEquals({a: 1, b: NaN}, {a: 1, b: NaN}); // true
 * stableEquals({a: 1, b: 2}, {a: 1, b: 3}); // false
 * stableEquals({a: 1, b: 2, c: 3}, {a: 1, b: 2}, ['c']); // true (ignores 'c' property)
 */
export const stableEquals = (
  left: unknown,
  right: unknown,
  omit?: PropertyKey[],
): boolean => {
  const omits = omit ? new Set(omit) : null;
  const visited = new Map<object, Set<object>>();
  return stableEqualsRecursive(left, right, visited, omits);
};

/**
 * Recursively compares the deep equality of two values.
 * Handles circular references and supports various data types.
 *
 * @param left - First value to compare
 * @param right - Second value to compare
 * @param visited - Map to track already visited object pairs
 * @param omits - Set of property keys to exclude from comparison
 * @returns true if the two values are equal, false otherwise
 */
const stableEqualsRecursive = (
  left: unknown,
  right: unknown,
  visited: Map<object, Set<object>>,
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
        if (!stableEqualsRecursive(left[index], right[index], visited, omits))
          return false;
    }
    return true;
  }

  const leftKeys = Reflect.ownKeys(left);

  if (leftKeys.length !== Reflect.ownKeys(right).length) return false;
  for (let index = 0; index < leftKeys.length; index++) {
    const key = leftKeys[index];
    if (omits?.has(key)) continue;
    if (!Reflect.has(right, key)) return false;
    if (
      !stableEqualsRecursive(
        (left as any)[key],
        (right as any)[key],
        visited,
        omits,
      )
    )
      return false;
  }

  return true;
};
