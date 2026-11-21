import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getWriteChild } from './getWriteChild';
import { isPlain } from './isPlain';

type InputChild<Self> = (
  key: string | number,
  entry: BlueprintChildEntry | undefined,
  child: Self | undefined,
  value: unknown,
  isNamed: boolean,
  isAmbiguous: boolean,
) => void;

/**
 * Visit the statically declared addresses reached by a branch input once per ancestor path.
 * @param template - Shape of the parent address
 * @param input - Interpreted branch input
 * @param live - Current occurrence, if any
 * @param seen - Input identities on the current recursive path
 * @param visit - Receives a candidate and its input, including sparse array positions
 * @param admits - Optional eligibility before resolving or reading a candidate
 * @returns False when the input has no branch to visit or repeats an ancestor
 */
export const visitInputChildren = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  input: unknown,
  live: Self | undefined,
  seen: WeakSet<object> | undefined,
  visit: InputChild<Self>,
  admits?: (key: string | number) => boolean,
): boolean => {
  const array = template.kind === 'array' && isArray(input) ? input : undefined;
  const object =
    template.kind === 'object' && isPlain(input) ? input : undefined;
  const container = array ?? object;
  if (!container || seen?.has(container)) return false;
  const names = object && Object.keys(object);
  const count = names?.length ?? array?.length ?? 0;
  seen?.add(container);
  try {
    for (let index = 0; index < count; index++) {
      const key = names?.[index] ?? index;
      if (admits && !admits(key)) continue;
      const { entry, child, isAmbiguous } = getWriteChild(template, live, key);
      if (entry || (array && child))
        visit(
          key,
          entry,
          child,
          Reflect.get(container, key),
          !!names || hasOwnProperty(container, key),
          isAmbiguous,
        );
    }
  } finally {
    seen?.delete(container);
  }
  return true;
};
