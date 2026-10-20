import { hasOwnProperty } from '@winglet/common-utils/lib';

import { sameValue } from '../../../utils/compute/sameValue';
import { writeObjectKey } from '../../../utils/writeObjectKey';

/**
 * Preserve undeclared keys in received order across a whole or partial write.
 * @param previous - Host's current extras object
 * @param input - Interpreted plain object being distributed
 * @param declared - Names owned by blueprint child declarations
 * @param merge - Whether untouched extras remain in the result
 * @returns Reused previous reference, a new extras object, or undefined
 */
export const nextExtras = (
  previous: unknown,
  input: Record<string, unknown>,
  declared: ReadonlySet<string>,
  merge: boolean,
): unknown => {
  const result: Record<string, unknown> = {};
  let hasOwnKey = false;
  if (merge && previous !== null && typeof previous === 'object')
    for (const name of Object.keys(previous)) {
      writeObjectKey(result, name, Reflect.get(previous, name));
      hasOwnKey ||= hasOwnProperty(result, name);
    }
  for (const name of Object.keys(input)) {
    if (declared.has(name)) continue;
    writeObjectKey(result, name, Reflect.get(input, name));
    hasOwnKey ||= hasOwnProperty(result, name);
  }
  const next = hasOwnKey ? result : undefined;
  return sameValue(previous, next) ? previous : next;
};

