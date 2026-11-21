import { hasOwnProperty } from '@winglet/common-utils/lib';

/**
 * Read one declared constituent from an already resolved storage host.
 * @param value - Snapshot or output at the group's physical parent address.
 * @param name - Validated declaration name, without pointer escaping.
 * @returns Its own stored value, or undefined when the host or key is absent.
 */
export const readLoadProperty = (value: unknown, name: string): unknown =>
  value !== null && typeof value === 'object' && hasOwnProperty(value, name)
    ? Reflect.get(value, name)
    : undefined;
