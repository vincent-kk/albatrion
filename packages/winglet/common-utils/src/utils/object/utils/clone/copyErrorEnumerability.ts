/**
 * Restore the source's enumerable surface after an Error constructor creates metadata.
 * @param target Error shell whose supported own properties have been copied.
 * @param source Original Error in any realm.
 * @returns Nothing; only enumerability of properties present on both objects changes.
 */
export function copyErrorEnumerability(target: object, source: object): void {
  for (const key of Reflect.ownKeys(target)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor && Object.getOwnPropertyDescriptor(target, key)?.enumerable !== descriptor.enumerable)
      Object.defineProperty(target, key, { enumerable: descriptor.enumerable });
  }
}
