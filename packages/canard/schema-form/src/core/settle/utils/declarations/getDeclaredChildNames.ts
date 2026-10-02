import type { BlueprintNode } from '../../../blueprint';

/** Immutable child-name indexes live only while their analyzed template lives. */
const DECLARED_NAMES = new WeakMap<BlueprintNode, ReadonlySet<string>>();

/**
 * Reuse declared child-name membership for writes and projected reads.
 * @param template - Immutable analyzed node shared by runtime occurrences
 * @returns Cached declared names; callers must not mutate this blueprint-owned index
 */
export const getDeclaredChildNames = (template: BlueprintNode): ReadonlySet<string> => {
  let names = DECLARED_NAMES.get(template);
  if (!names) {
    names = new Set(template.childEntries.map((entry) => entry.name));
    DECLARED_NAMES.set(template, names);
  }
  return names;
};
