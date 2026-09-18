import type { FingerprintOptions } from '../type';

/** Tests an exclusion collection without allocating a Set for a one-off array. */
export function isOmitted(
  key: string,
  omit: FingerprintOptions['omit'],
): boolean {
  return (
    !!omit &&
    (Array.isArray(omit)
      ? omit.includes(key)
      : (omit as ReadonlySet<string>).has(key))
  );
}
