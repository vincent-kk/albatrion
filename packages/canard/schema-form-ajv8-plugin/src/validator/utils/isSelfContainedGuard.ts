/** Keys whose meaning depends on a schema's registered resource context. */
const contextualKeys = [
  '$ref', '$dynamicRef', '$recursiveRef', '$id',
  '$anchor', '$dynamicAnchor', '$recursiveAnchor',
];

/**
 * Check every nested object once before compiling a guard outside its root.
 * @param schema - A value within the copy's guard schema, including annotations.
 * @param cache - Weak results for this registration's immutable schema objects.
 * @param legacyId - Whether the Ajv profile treats draft-04 id as an identifier.
 * @returns True when no contextual key occurs anywhere in the schema.
 */
export const isSelfContainedGuard = (
  schema: unknown,
  cache: WeakMap<object, boolean>,
  legacyId = false,
): boolean => {
  if (typeof schema !== 'object' || schema === null) return true;
  const previous = cache.get(schema);
  if (previous !== undefined) return previous;
  const result = Object.entries(schema).every(([key, value]) =>
    !contextualKeys.includes(key) && !(legacyId && key === 'id') &&
    isSelfContainedGuard(value, cache, legacyId));
  cache.set(schema, result);
  return result;
};
