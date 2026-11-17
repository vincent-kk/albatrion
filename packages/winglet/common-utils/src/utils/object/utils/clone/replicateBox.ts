import {
  BOOLEAN_TAG,
  NUMBER_TAG,
  STRING_TAG,
} from '@/common-utils/constant/typeTag';
import { getTypeTag } from '@/common-utils/libs/getTypeTag';

/**
 * Creates a new box holding the primitive of a boxed Number, String or Boolean.
 *
 * The primitive is read through the built-in prototype `valueOf`, so an overridden
 * `valueOf` cannot change it. The type tag confirms the internal value slot, which a
 * prototype chain alone cannot: `Object.create(Number.prototype)` has none.
 *
 * @param value - An object whose prototype chain passes through a box prototype
 * @param prototype - The prototype the new box must carry
 * @returns The new box, or `null` when `value` holds no primitive value slot
 */
export const replicateBox = (
  value: object,
  prototype: object | null,
): object | null => {
  const tag = getTypeTag(value);
  const box =
    tag === NUMBER_TAG
      ? Object(numberValueOf.call(value))
      : tag === STRING_TAG
        ? Object(stringValueOf.call(value))
        : tag === BOOLEAN_TAG
          ? Object(booleanValueOf.call(value))
          : null;
  if (box !== null && Object.getPrototypeOf(box) !== prototype)
    Object.setPrototypeOf(box, prototype);
  return box;
};

const numberValueOf = Number.prototype.valueOf;
const stringValueOf = String.prototype.valueOf;
const booleanValueOf = Boolean.prototype.valueOf;
