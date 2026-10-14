import { StaticFirstLoadCapability } from '../../../blueprint';
import type { Blueprint, BlueprintNode } from '../../../blueprint';
import type { VirtualReferenceIndex } from '../../type';

/** Reverse field references live for the lifetime of one analyzed blueprint. */
const REFERENCES = new WeakMap<Blueprint, VirtualReferenceIndex | null>();

/**
 * Resolve the reverse index once per settlement and cache it per blueprint.
 * @param blueprint - Analysis whose virtual fields may reference real siblings
 * @returns Host and field index, or null when no virtual declarations exist
 */
export const getVirtualReferenceIndex = (
  blueprint: Blueprint,
): VirtualReferenceIndex | null => {
  let index = REFERENCES.get(blueprint);
  if (index !== undefined) return index;
  // Static first-load eligibility already proves the blueprint has no virtual node.
  if (StaticFirstLoadCapability.has(blueprint)) {
    REFERENCES.set(blueprint, null);
    return null;
  }
  let hosts: Map<BlueprintNode, Map<string, string[]>> | undefined;
  for (const host of blueprint.nodes) {
    let fields: Map<string, string[]> | undefined;
    for (const entry of host.childEntries) {
      if (entry.node.kind !== 'virtual') continue;
      fields ??= new Map();
      for (const field of entry.node.fields ?? []) {
        const names = fields.get(field) ?? [];
        names.push(entry.name);
        fields.set(field, names);
      }
    }
    if (fields) {
      hosts ??= new Map();
      hosts.set(host, fields);
    }
  }
  index = hosts ?? null;
  REFERENCES.set(blueprint, index);
  return index;
};
