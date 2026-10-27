import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

/**
 * Keep a settlement's path lookup in step with one latent key.
 * @param index - Call-local keys grouped by their path and ancestor paths
 * @param key - Encoded path and kind stored in literalStarRaw
 * @param path - Decoded absolute path from the key
 * @param present - Whether the key is now present in literalStarRaw
 * @returns Nothing; the index is updated in place
 */
export const indexLiteralStarDescendant = (
  index: Map<string, Set<string>>,
  key: string,
  path: string,
  present: boolean,
): void => {
  let ancestor = path;
  while (true) {
    if (present) {
      const descendants = index.get(ancestor) ?? new Set<string>();
      descendants.add(key);
      index.set(ancestor, descendants);
    } else {
      const descendants = index.get(ancestor);
      descendants?.delete(key);
      if (descendants?.size === 0) index.delete(ancestor);
    }
    if (!ancestor) break;
    ancestor = ancestor.slice(0, ancestor.lastIndexOf($.Separator));
  }
};
