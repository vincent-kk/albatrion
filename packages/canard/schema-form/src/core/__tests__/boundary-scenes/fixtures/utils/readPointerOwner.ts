import { isObject } from '@winglet/common-utils/filter';

/**
 * Walk a JSON Pointer to the value that holds its last segment.
 * @param target - The value to walk; segments are plain keys, without escapes
 * @param pointer - A pointer below the root, such as `/inner/n`
 * @returns The holder (`undefined` when the walk leaves the objects) and the last segment's key
 */
export const readPointerOwner = (
  target: unknown,
  pointer: string,
): { owner: unknown; key: string } => {
  const keys = pointer.split('/').slice(1);
  const owner = keys
    .slice(0, -1)
    .reduce<unknown>(
      (at, key) => (isObject(at) ? Reflect.get(at, key) : undefined),
      target,
    );
  return { owner, key: keys[keys.length - 1] };
};
