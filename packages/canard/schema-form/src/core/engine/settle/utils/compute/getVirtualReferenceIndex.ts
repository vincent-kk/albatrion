import { StaticFirstLoadCapability } from '../../../blueprint';
import type { Blueprint, BlueprintNode } from '../../../blueprint';
import { getBlueprintDerived } from '../../../utils/cache/derivedRecords';
import type { VirtualReferenceIndex } from '../../types/settlement';

/** Reverse field references live for the lifetime of one analyzed blueprint. */

/**
 * Resolve the reverse index once per settlement and cache it per blueprint.
 * @param blueprint - Analysis whose virtual fields may reference real siblings
 * @returns Host and field index, or null when no virtual declarations exist
 */
export const getVirtualReferenceIndex = (
  blueprint: Blueprint,
): VirtualReferenceIndex | null => {
  let index = getBlueprintDerived<
    'virtualReferenceIndex',
    VirtualReferenceIndex | null
  >(blueprint).virtualReferenceIndex;
  if (index !== undefined) return index;
  // Static first-load eligibility already proves the blueprint has no virtual node.
  if (StaticFirstLoadCapability.has(blueprint)) {
    getBlueprintDerived<'virtualReferenceIndex', VirtualReferenceIndex | null>(
      blueprint,
    ).virtualReferenceIndex = null;
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
  getBlueprintDerived<'virtualReferenceIndex', VirtualReferenceIndex | null>(
    blueprint,
  ).virtualReferenceIndex = index;
  return index;
};
