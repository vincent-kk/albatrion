import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary, Nullable } from '@aileron/declare';

import { mergeEffectiveSchema } from '../../../../blueprint';
import type {
  BlueprintChildEntry,
  BlueprintNode,
  BlueprintOptions,
  EffectiveSchema,
} from '../../../../blueprint';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';
import { staticIds } from './staticIds';

/** Ungated effective schemas select their immutable static contributions. */
const NO_ACTIVE_IDS: readonly number[] = Object.freeze([]);
/** Immutable selected static edge and its fixed schema. */
export interface StaticShapeEntry {
  entry: BlueprintChildEntry;
  ids: readonly number[];
  schema: EffectiveSchema;
}
/** The entry list and its derivative are populated independently. */
export interface StaticShapeMemo {
  entries?: Nullable<readonly StaticShapeEntry[]>;
  byEntry?: Map<BlueprintChildEntry, StaticShapeEntry>;
}

/**
 * Memoize the fixed static entries in the structure's property order.
 * @param host - Object blueprint host whose child edges are inspected once
 * @param isAtomic - Atomic-schema predicate of the owning form's blueprint options
 * @param candidates - Fixed static partition, or every edge on the original ungated path
 * @returns The admitted static subset with stable IDs and schemas; unsafe entries
 *   remain on general selection, and later calls return the same subset
 */
export const staticShape = (
  host: BlueprintNode,
  isAtomic: BlueprintOptions['isAtomic'],
  candidates: readonly BlueprintChildEntry[] = host.childEntries,
): Nullable<readonly StaticShapeEntry[]> => {
  const memo = (getHostDerived<'staticShape', StaticShapeMemo>(
    host,
  ).staticShape ??= {});
  if (memo.entries !== undefined) return memo.entries;
  const selected: Dictionary<{
    entry: BlueprintChildEntry;
    ids: readonly number[];
    schema: EffectiveSchema;
  }> = Object.create(null);
  const entries = candidates;
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    const schema = mergeEffectiveSchema(entry.node, NO_ACTIVE_IDS, {
      mode: 'runtime',
      isAtomic,
    });
    let hasGate = false;
    for (
      let declarationIndex = 0;
      declarationIndex < entry.declarations.length;
      declarationIndex++
    )
      if (entry.declarations[declarationIndex].gates.length > 0) {
        hasGate = true;
        break;
      }
    if (
      hasOwnProperty(selected, entry.name) ||
      entry.node.kind === 'virtual' ||
      !entry.declarations.length ||
      schema.typeConflict ||
      hasGate
    ) {
      continue;
    }
    selected[entry.name] = { entry, ids: staticIds(entry, host), schema };
  }
  const shape = Object.values(selected);
  memo.entries = shape;
  return shape;
};
