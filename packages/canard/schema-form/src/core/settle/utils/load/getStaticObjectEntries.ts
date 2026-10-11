import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';

/** Property enumeration order is shared by every occurrence of a static template. */
const ENTRIES = new WeakMap<BlueprintNode, readonly BlueprintChildEntry[]>();

/**
 * Preserve the generic structure's integer-name order without reselecting shape.
 * @param template - Proven ungated object template
 * @returns Stable entries in Object.values property order
 */
export const getStaticObjectEntries = (template: BlueprintNode): readonly BlueprintChildEntry[] => {
  const cached = ENTRIES.get(template);
  if (cached) return cached;
  const byName: Record<string, BlueprintChildEntry> = Object.create(null);
  const entries = template.childEntries;
  for (let index = 0; index < entries.length; index++) byName[entries[index].name] = entries[index];
  const result = Object.freeze(Object.values(byName));
  ENTRIES.set(template, result);
  return result;
};
