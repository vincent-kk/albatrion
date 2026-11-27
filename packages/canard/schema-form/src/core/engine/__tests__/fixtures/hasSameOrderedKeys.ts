/**
 * Compare own enumerable key order recursively in a pair of acyclic observations.
 * @param left - One observed form value or updater input
 * @param right - Independent sequential observation
 * @returns Whether every nested object's and array's own key list is identical
 */
export const hasSameOrderedKeys = (left: unknown, right: unknown): boolean => {
  if (left === right) return true;
  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  )
    return typeof left !== 'object' && typeof right !== 'object';
  const keys = Object.keys(left);
  const expected = Object.keys(right);
  return (
    keys.length === expected.length &&
    keys.every(
      (name, index) =>
        name === expected[index] &&
        hasSameOrderedKeys(Reflect.get(left, name), Reflect.get(right, name)),
    )
  );
};
