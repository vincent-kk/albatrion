import { resolvePointer } from '@/schema-form/helpers/jsonPointer';

/**
 * Resolve an authored expression path against its current data host.
 * @param hostPath - Absolute JSON Pointer host of the bound gate
 * @param dependency - Relative, absolute, root, or context token
 * @returns Absolute pointer, or `@` for the tree context slot
 */
export const resolveDependencyPath = (
  hostPath: string,
  dependency: string,
): string => {
  return resolvePointer(hostPath, dependency);
};
