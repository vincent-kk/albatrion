/**
 * Resolve a guard in the engine copy without cloning its schema.
 * @param root - The engine-owned copy containing the guard.
 * @param pointer - A JSON Pointer, optionally prefixed with a fragment marker.
 * @returns The same schema object or boolean; undefined for a missing location.
 */
export const resolveGuardSchema = (root: object, pointer: string): object | boolean | undefined => {
  const path = pointer.startsWith('#') ? pointer.slice(1) : pointer;
  let schema: unknown = root;
  for (const token of path === '' ? [] : path.slice(1).split('/')) {
    const key = token.replace(/~1/g, '/').replace(/~0/g, '~');
    if (typeof schema !== 'object' || schema === null || !Object.prototype.hasOwnProperty.call(schema, key))
      return undefined;
    schema = (schema as Record<string, unknown>)[key];
  }
  return typeof schema === 'boolean' || (typeof schema === 'object' && schema !== null)
    ? schema : undefined;
};
