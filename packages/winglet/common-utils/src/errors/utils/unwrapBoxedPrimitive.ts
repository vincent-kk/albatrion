import { BOOLEAN_TAG, NUMBER_TAG, STRING_TAG } from '../../constant';
import { getTypeTag } from '../../libs';

/** Native valueOf methods verify internal slots even across execution realms. */
const primitiveBrands: ReadonlyArray<
  readonly [string, (this: object) => unknown]
> = [
  [NUMBER_TAG, Number.prototype.valueOf],
  [STRING_TAG, String.prototype.valueOf],
  [BOOLEAN_TAG, Boolean.prototype.valueOf],
  ['[object BigInt]', BigInt.prototype.valueOf],
];

/**
 * Unboxes JSON primitive wrappers while preserving ordinary objects.
 * @param value - Object after its JSON hook; spoofed tags do not establish a brand.
 * @returns Its primitive value, or the original object when it is not a wrapper.
 * Number/string coercion follows JSON semantics and propagates user exceptions.
 */
export const unwrapBoxedPrimitive = (value: object): unknown => {
  const tag = getTypeTag(value);
  const customTag = Symbol.toStringTag in value;
  for (const [brand, unwrap] of primitiveBrands) {
    if (!customTag && tag !== brand) continue;
    let primitive: unknown;
    try {
      primitive = unwrap.call(value);
    } catch {
      continue;
    }
    if (typeof primitive === 'number') return +value;
    if (typeof primitive === 'string') return String(value);
    return primitive;
  }
  return value;
};
