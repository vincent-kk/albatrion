/**
 * Copies enumerable own data while retaining a supported dictionary's prototype.
 * @param source - Ordinary or null-prototype object whose nested values remain shared
 * @returns A shallow copy with the source container's prototype
 */
export const copyObject = <T extends object>(source: T): T =>
  isLocalObjectInstance(source)
    ? { ...source }
    : Object.getPrototypeOf(source) === null
      ? Object.assign(Object.create(null), source)
      : { ...source };

/** Return a boolean local-realm prototype-chain check without narrowing the copy domain. */
const isLocalObjectInstance = (value: object): boolean => value instanceof Object;
