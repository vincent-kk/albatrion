import {
  BOOLEAN_TAG,
  NUMBER_TAG,
  STRING_TAG,
} from '@/common-utils/constant/typeTag';
import { getTypeTag } from '@/common-utils/libs/getTypeTag';

/** What cloning needs to know about a prototype chain, computed once per prototype. */
export interface PrototypeProfile {
  /** Whether the chain passes through a Number, String or Boolean prototype of any realm */
  readonly boxed: boolean;
  /**
   * Inherited keys besides `__proto__` whose accessor or read-only property would
   * intercept assignment, or `null` when there are none
   */
  readonly intercepted: ReadonlySet<PropertyKey> | null;
}

/**
 * Returns the profile of a prototype chain, computing it on first use.
 *
 * `Object.prototype` and `null` share one fixed profile without a lookup, since only
 * `__proto__` intercepts assignment there. Any other profile is cached per prototype in
 * module state and never invalidated: a member added to the chain after its first clone
 * is not in the profile, so it is assigned: an added setter runs, and an added getter-only
 * or read-only property makes the assignment throw a `TypeError`. A member removed later
 * is defined, which gives the same result as assigning it.
 *
 * Box prototypes are recognized by their type tag (`Number.prototype` is itself a
 * Number object), so a box prototype from another realm counts as one.
 *
 * @param prototype - The prototype of the value being cloned
 * @returns The profile of `prototype`'s chain
 */
export const getPrototypeProfile = (
  prototype: object | null,
): PrototypeProfile => {
  if (prototype === OBJECT_PROTOTYPE || prototype === null)
    return PLAIN_PROFILE;
  let profile = profiles.get(prototype);
  if (profile !== undefined) return profile;
  let boxed = false;
  let intercepted: Set<PropertyKey> | null = null;
  for (
    let link: object | null = prototype;
    link !== null && link !== OBJECT_PROTOTYPE;
    link = Object.getPrototypeOf(link)
  ) {
    if (BOX_TAGS.includes(getTypeTag(link))) boxed = true;
    for (const key of Reflect.ownKeys(link)) {
      const descriptor = Object.getOwnPropertyDescriptor(link, key);
      // Accessors carry no `writable`; read-only data carries `false`
      if (descriptor !== undefined && descriptor.writable !== true)
        (intercepted ??= new Set()).add(key);
    }
  }
  profiles.set(prototype, (profile = { boxed, intercepted }));
  return profile;
};

const OBJECT_PROTOTYPE = Object.prototype;
const BOX_TAGS: readonly string[] = [NUMBER_TAG, STRING_TAG, BOOLEAN_TAG];
const PLAIN_PROFILE: PrototypeProfile = { boxed: false, intercepted: null };
const profiles = new WeakMap<object, PrototypeProfile>();
