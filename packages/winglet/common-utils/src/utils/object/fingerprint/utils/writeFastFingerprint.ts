import type { FingerprintOptions } from '../type';
import { isOmitted } from './isOmitted';

/** Produces the legacy shallow key format; nested values follow native JSON semantics. */
export function writeFastFingerprint(
  value: any,
  omit?: FingerprintOptions['omit'],
): string {
  if (!value || typeof value !== 'object')
    return JSON.stringify(value) ?? String(value);
  const keys = Object.keys(value);
  if (Array.isArray(omit) && omit.length >= 32 && keys.length >= 64)
    omit = new Set(omit);
  const segments = new Array<string>(keys.length);
  let length = 0;
  let key: string | undefined;
  while ((key = keys.pop()) !== undefined) {
    if (omit && isOmitted(key, omit)) continue;
    const item = value[key];
    segments[length++] =
      key + ':' + (typeof item === 'object' ? JSON.stringify(item) : item);
  }
  segments.length = length;
  return segments.join('|');
}
