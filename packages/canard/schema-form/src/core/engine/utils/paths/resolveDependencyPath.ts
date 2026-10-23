import {
  JSONPointer as $,
  JSONPointerPrefix,
} from '@/schema-form/helpers/jsonPointer';

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
  if (dependency === $.Context) return $.Context;
  if (dependency === $.Fragment || dependency === $.Separator) return '';
  if (dependency.startsWith(JSONPointerPrefix.Fragment))
    return dependency.slice(1);
  if (dependency.startsWith($.Separator)) return dependency;
  const parts = hostPath.split($.Separator).filter(Boolean);
  let remaining = dependency;
  while (remaining.startsWith(JSONPointerPrefix.Parent)) {
    parts.pop();
    remaining = remaining.slice(3);
  }
  if (remaining.startsWith(JSONPointerPrefix.Current))
    remaining = remaining.slice(2);
  if (remaining) parts.push(...remaining.split($.Separator));
  return parts.length ? '/' + parts.join($.Separator) : '';
};
