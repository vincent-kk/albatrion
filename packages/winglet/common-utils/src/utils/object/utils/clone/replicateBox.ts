import {
  BOOLEAN_TAG,
  NUMBER_TAG,
  STRING_TAG,
} from '@/common-utils/constant/typeTag';
import { getTypeTag } from '@/common-utils/libs/getTypeTag';

/**
 * Creates a new box holding the primitive of a boxed Number, String or Boolean.
 *
 * The primitive is read through this realm's built-in prototype `valueOf`, which also
 * reads a box from another realm, so an overridden `valueOf` cannot change it.
 * `Object.create(Number.prototype)` has no value slot; neither does an object that
 * only forges the tag through `Symbol.toStringTag`. Both yield `null`.
 *
 * @param value - An object whose prototype chain passes through a box prototype
 * @param prototype - The prototype the new box must carry
 * @returns The new box, or `null` when `value` holds no primitive value slot
 */
export const replicateBox = (
  value: object,
  prototype: object | null,
): object | null => {
  const unbox = UNBOX_BY_TAG[getTypeTag(value)];
  if (unbox === undefined) return null;
  let box: object;
  try {
    box = Object(unbox.call(value));
  } catch {
    return null;
  }
  if (Object.getPrototypeOf(box) !== prototype)
    Object.setPrototypeOf(box, prototype);
  return box;
};

const UNBOX_BY_TAG: Readonly<
  Record<string, ((this: object) => unknown) | undefined>
> = {
  [NUMBER_TAG]: Number.prototype.valueOf,
  [STRING_TAG]: String.prototype.valueOf,
  [BOOLEAN_TAG]: Boolean.prototype.valueOf,
};
