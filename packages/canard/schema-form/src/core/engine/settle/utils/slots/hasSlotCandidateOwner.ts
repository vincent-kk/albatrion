import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';

/** Repeated candidate-name membership is prepared once per immutable template. */
const propertyCandidates = new WeakMap<BlueprintNode, ReadonlySet<string>>();

/**
 * Read whether an ancestor occurrence establishes candidate source ownership.
 * @param node - Exiting occurrence, including nested arrays inside a candidate
 * @returns Whether the baseline's candidate-only array retention exception applies
 */
export const hasSlotCandidateOwner = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => {
  for (
    let current: Self | null = node;
    current?.parent;
    current = current.parent
  ) {
    const host = current.parent.blueprintNode;
    if (host.kind === 'array') {
      const candidates = host.prefixItems?.[Number(current.name)]
        ? host.prefixItemCandidates?.[Number(current.name)]
        : host.itemCandidates;
      if (candidates && candidates.length > 1) return true;
    } else if (host.hasPropertyCandidates) {
      let names = propertyCandidates.get(host);
      if (!names) {
        const counts = new Map<string, number>();
        const repeated = new Set<string>();
        for (const entry of host.childEntries) {
          const count = (counts.get(entry.name) ?? 0) + 1;
          counts.set(entry.name, count);
          if (count > 1) repeated.add(entry.name);
        }
        propertyCandidates.set(host, (names = repeated));
      }
      if (names.has(current.name)) return true;
    }
  }
  return false;
};
