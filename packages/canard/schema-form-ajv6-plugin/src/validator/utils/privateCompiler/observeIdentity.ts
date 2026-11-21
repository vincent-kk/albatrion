/**
 * Observe identity without retaining an application-owned object or function.
 * @param identities - Realm-shared per-application weak identity table.
 * @param value - Current application value; primitives keep their native identity.
 * @returns An opaque token for an object or function, or the primitive unchanged.
 */
export const observeIdentity = (
  identities: WeakMap<object, object>,
  value: unknown,
): unknown => {
  if (
    value === null ||
    (typeof value !== 'object' && typeof value !== 'function')
  )
    return value;
  let token = identities.get(value);
  if (!token) {
    token = {};
    identities.set(value, token);
  }
  return token;
};
