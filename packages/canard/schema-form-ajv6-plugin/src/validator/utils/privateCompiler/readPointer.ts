/**
 * Resolve a URI-fragment JSON Pointer using own properties only.
 * @param root - Raw document selected by current native registration.
 * @param fragment - URI fragment containing a JSON Pointer, with or without its leading slash.
 * @param uriFragment - Decode URI escapes for external fragments; false accepts an already decoded schema pointer.
 * @returns The selected object or boolean schema, or undefined for a missing or non-schema target.
 */
export const readPointer = (
  root: object | boolean,
  fragment: string,
  uriFragment = true,
): object | boolean | undefined => {
  let current: unknown = root;
  const pointer = uriFragment ? decodeURIComponent(fragment) : fragment;
  if (!pointer) return root;
  if (pointer[0] !== '/') return undefined;
  for (const segment of pointer.slice(1).split('/')) {
    const key = segment.replace(/~1/g, '/').replace(/~0/g, '~');
    if (
      !current ||
      typeof current !== 'object' ||
      !Object.prototype.hasOwnProperty.call(current, key)
    )
      return undefined;
    current = Reflect.get(current, key);
  }
  return typeof current === 'boolean' ||
    (current !== null && typeof current === 'object')
    ? current
    : undefined;
};
