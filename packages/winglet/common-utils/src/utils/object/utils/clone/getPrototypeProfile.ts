/** What cloning needs to know about a prototype chain, computed once per prototype. */
export interface PrototypeProfile {
  /** Whether the chain passes through the Number, String or Boolean prototype */
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
 * `__proto__` intercepts assignment there. Any other profile is cached per prototype
 * in module state. A chain changed after its first clone keeps its old profile: a
 * member added later intercepts assignment as it did before profiles existed, and a
 * member removed later only turns an assignment into a definition with the same result.
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
    if (BOX_PROTOTYPES.includes(link)) boxed = true;
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
const BOX_PROTOTYPES: readonly object[] = [
  Number.prototype,
  String.prototype,
  Boolean.prototype,
];
const PLAIN_PROFILE: PrototypeProfile = { boxed: false, intercepted: null };
const profiles = new WeakMap<object, PrototypeProfile>();
