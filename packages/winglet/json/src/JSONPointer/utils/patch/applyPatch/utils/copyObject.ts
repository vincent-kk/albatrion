/**
 * Copies enumerable own data while retaining a supported dictionary's prototype.
 * @param source - Ordinary or null-prototype object whose nested values remain shared
 * @returns A shallow copy with the source container's prototype
 */
export const copyObject = <T extends object>(source: T): T =>
  Object.getPrototypeOf(source) === null
    ? Object.assign(Object.create(null), source)
    : { ...source };
