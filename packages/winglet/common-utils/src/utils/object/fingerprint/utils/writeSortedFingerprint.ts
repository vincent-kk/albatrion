import type { FingerprintOptions } from '../type';
import { isOmitted } from './isOmitted';

/** Produces sorted flattened paths with ancestor-cycle markers and recursive exclusions. */
export function writeSortedFingerprint(
  value: any,
  omit?: FingerprintOptions['omit'],
): string {
  if (!value || typeof value !== 'object') return String(value);
  const stack: Array<{ value: any; path: string; exit?: boolean }> = [
    { value, path: '' },
  ];
  const parts: string[] = [];
  const ancestors = new WeakSet<object>();
  while (stack.length) {
    const entry = stack.pop()!;
    if (entry.exit) {
      ancestors.delete(entry.value);
      continue;
    }
    ancestors.add(entry.value);
    stack.push({ value: entry.value, path: entry.path, exit: true });
    const keys = Object.keys(entry.value).sort();
    for (const key of keys) {
      if (omit && isOmitted(key, omit)) continue;
      const item = entry.value[key];
      const path = entry.path ? entry.path + '.' + key : key;
      if (item && typeof item === 'object') {
        if (ancestors.has(item)) parts.push(path + ':[Circular]');
        else stack.push({ value: item, path });
      } else parts.push(path + ':' + String(item));
    }
  }
  return parts.join('|');
}
