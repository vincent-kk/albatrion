import { hasOwnProperty } from '@winglet/common-utils/lib';

/**
 * Stage only dynamic own entries while exposing the immutable baseline to gate reads.
 * @param baseline - Fixed null-prototype structure whose occurrences stay active
 * @param current - Round-entry view; the fixed baseline has no dynamic members
 * @param names - Previous dynamic names, used only to preserve the round-entry shape
 * @param dynamic - Caller-owned dynamic target, retained for own-key publication order
 * @returns A private view; enumeration materializes keys in ordinary object order.
 * The caller publishes an ordinary structure before ending selection. No prior shape is mutated.
 */
export const createPreparedSelectionStructure = <Self>(
  baseline: Record<string, Self>,
  current: Record<string, Self> | null | undefined,
  names: readonly string[],
  dynamic: Record<string, Self>,
): Record<string, Self> => {
  if (current && current !== baseline)
    for (const name of names)
      if (hasOwnProperty(current, name)) dynamic[name] = current[name];
  return new Proxy(dynamic, {
    getPrototypeOf: () => null,
    getOwnPropertyDescriptor: (target, name) =>
      Object.getOwnPropertyDescriptor(target, name) ??
      Object.getOwnPropertyDescriptor(baseline, name),
    ownKeys: (target) => Reflect.ownKeys({ ...baseline, ...target }),
    set: (target, name, value) => {
      if (hasOwnProperty(baseline, name))
        throw new Error('Static host baseline mutation');
      Object.defineProperty(target, name, {
        configurable: true,
        enumerable: true,
        writable: true,
        value,
      });
      return true;
    },
  });
};
