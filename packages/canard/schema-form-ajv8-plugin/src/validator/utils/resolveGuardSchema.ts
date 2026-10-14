/**
 * Resolve a guard in the engine copy without cloning its schema.
 * @param root - The engine-owned copy containing the guard.
 * @param pointer - A JSON Pointer, or a percent-encoded URI fragment prefixed with #.
 * @returns The same schema object or boolean; undefined for malformed fragment encoding, missing locations, or non-schema values.
 */
export const resolveGuardSchema = (
  root: object,
  pointer: string,
): object | boolean | undefined => {
  let path = pointer;
  if (pointer.startsWith('#')) {
    try {
      path = decodeURIComponent(pointer.slice(1));
    } catch {
      return undefined;
    }
  }
  let schema: unknown = root;
  for (const token of path === '' ? [] : path.slice(1).split('/')) {
    const key = token.replace(/~1/g, '/').replace(/~0/g, '~');
    if (
      typeof schema !== 'object' ||
      schema === null ||
      !Object.prototype.hasOwnProperty.call(schema, key)
    )
      return undefined;
    schema = Reflect.get(schema, key);
  }
  return typeof schema === 'boolean' ||
    (typeof schema === 'object' && schema !== null && !Array.isArray(schema))
    ? schema
    : undefined;
};
