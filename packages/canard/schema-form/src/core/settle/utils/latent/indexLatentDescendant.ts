/**
 * Keep a settlement's proper-ancestor lookup in step with one latent key.
 * @param index - Call-local descendant keys grouped by ancestor path
 * @param key - Encoded path and kind stored in latentRaw
 * @param path - Decoded absolute path from the key's metadata
 * @param present - Whether the key is now present in latentRaw
 * @returns Nothing; the index is updated in place
 */
export const indexLatentDescendant = (
  index: Map<string, Set<string>>, key: string, path: string, present: boolean,
): void => {
  const separator = path.lastIndexOf('/');
  if (separator < 0) return;
  let ancestor = path.slice(0, separator);
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
    ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
  }
};
