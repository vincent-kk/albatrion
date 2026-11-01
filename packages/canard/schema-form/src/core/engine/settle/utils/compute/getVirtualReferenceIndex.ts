import type { Nullable, Optional } from '@aileron/declare';

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
): Nullable<VirtualReferenceIndex> => {
  let index = getBlueprintDerived<
    'virtualReferenceIndex',
    Nullable<VirtualReferenceIndex>
  >(blueprint).virtualReferenceIndex;
  if (index !== undefined) return index;
  // Static first-load eligibility already proves the blueprint has no virtual node.
  if (StaticFirstLoadCapability.has(blueprint)) {
    getBlueprintDerived<
      'virtualReferenceIndex',
      Nullable<VirtualReferenceIndex>
    >(blueprint).virtualReferenceIndex = null;
    return null;
  }
  let hosts: Optional<Map<BlueprintNode, Map<string, string[]>>>;
  for (const host of blueprint.nodes) {
    let fields: Optional<Map<string, string[]>>;
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
  getBlueprintDerived<'virtualReferenceIndex', Nullable<VirtualReferenceIndex>>(
    blueprint,
  ).virtualReferenceIndex = index;
  return index;
};
