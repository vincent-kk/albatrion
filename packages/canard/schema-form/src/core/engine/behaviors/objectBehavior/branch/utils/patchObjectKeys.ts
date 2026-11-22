import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary } from '@aileron/declare';

import { writeObjectKey } from '../../../../utils/writeObjectKey';
import { copyObjectValue } from './copyObjectValue';

/**
 * Patch changed values after a caller has established the previous key order.
 * @param previous - Previously assembled object.
 * @param children - Projections to inspect for changes.
 * @param keyCount - Proven number of own keys used when copying the value.
 * @returns The previous reference or a patched copy, or undefined when keys must be reassembled.
 */
export const patchObjectKeys = (
  previous: object,
  children: readonly unknown[],
  keyCount: number,
): object | undefined => {
  let patch: Dictionary<unknown> | undefined;
  for (const child of children) {
    if (
      child === null ||
      typeof child !== 'object' ||
      !('name' in child) ||
      typeof child.name !== 'string' ||
      !('storedOutputValue' in child)
    )
      return;
    const oldHasKey = hasOwnProperty(previous, child.name);
    if ((child.storedOutputValue === undefined) === oldHasKey) return;
    if (
      oldHasKey &&
      !Object.is(child.storedOutputValue, Reflect.get(previous, child.name))
    ) {
      if (!patch) patch = copyObjectValue(previous, keyCount);
      writeObjectKey(patch, child.name, child.storedOutputValue);
    }
  }
  return patch ?? previous;
};
