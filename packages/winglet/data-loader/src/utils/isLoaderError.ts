import { getTypeTag } from '@winglet/common-utils/lib';

/** Native Error brand check, available on newer JavaScript runtimes. */
const isNativeError: ((value: unknown) => boolean) | undefined = Reflect.get(
  Error,
  'isError',
);

/**
 * Recognize errors supplied through the load result or cache value channel.
 * @param value Caller-owned value that may come from another realm.
 * @returns Whether the loader should reject with this value.
 */
export function isLoaderError(value: unknown): value is Error {
  if (value instanceof Error) return true;
  if (typeof value !== 'object' || value === null) return false;
  if (isNativeError) return isNativeError(value);
  try {
    return (
      !(Symbol.toStringTag in value) && getTypeTag(value) === '[object Error]'
    );
  } catch {
    return false;
  }
}
