import { hasOwnProperty } from '@winglet/common-utils/lib';

/** Treat React elements, component descriptors, and refs as indivisible schema hints. */
export const isRenderAtomic = (value: unknown): boolean =>
  !!value &&
  typeof value === 'object' &&
  (hasOwnProperty(value, '$$typeof') || hasOwnProperty(value, 'current'));
