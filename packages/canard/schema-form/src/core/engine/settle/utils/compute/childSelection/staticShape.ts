import { hasOwnProperty } from '@winglet/common-utils/lib';

import { mergeEffectiveSchema } from '../../../../blueprint';
import { HostStaticPartition } from '../../../../blueprint';
import type {
  BlueprintChildEntry,
  BlueprintNode,
  BlueprintOptions,
  EffectiveSchema,
} from '../../../../blueprint';
import { staticIds } from './staticIds';

/** Ungated effective schemas select their immutable static contributions. */
const NO_ACTIVE_IDS: readonly number[] = Object.freeze([]);
/** Immutable, ungated object shapes shared by occurrences of one blueprint host. */
const STATIC_SHAPES = new WeakMap<
  BlueprintNode,
  | readonly {
      entry: BlueprintChildEntry;
      ids: readonly number[];
      schema: EffectiveSchema;
    }[]
  | null
>();

/**
 * Memoize the fixed static entries in the structure's property order.
 * @param host - Object blueprint host whose child edges are inspected once
 * @param isAtomic - Atomic-schema predicate of the owning form's blueprint options
 * @returns The admitted static subset with stable IDs and schemas; unsafe entries
 *   remain on general selection, and later calls return the same subset
 */
export const staticShape = (
  host: BlueprintNode,
  isAtomic: BlueprintOptions['isAtomic'],
) => {
  if (STATIC_SHAPES.has(host)) return STATIC_SHAPES.get(host);
  const selected: Record<
    string,
    {
      entry: BlueprintChildEntry;
      ids: readonly number[];
      schema: EffectiveSchema;
    }
  > = Object.create(null);
  const entries = HostStaticPartition.get(host).staticEntries;
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
    selected[entry.name] = { entry, ids: staticIds(entry), schema };
  }
  const shape = Object.values(selected);
  STATIC_SHAPES.set(host, shape);
  return shape;
};
