import { hasOwnProperty } from '@winglet/common-utils/lib';

import { mergeEffectiveSchema } from '../../../../blueprint';
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
 * Memoize an unambiguous static host in the structure's property order.
 * @param host - Object blueprint host whose child edges are inspected once
 * @param isAtomic - Atomic-schema predicate of the owning form's blueprint options
 * @returns One entry per child with its static IDs and ungated schema, or null when
 *   a duplicate name, virtual child, empty declaration list, type conflict or gate
 *   rules the static shape out; the same value is returned on every later call
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
  for (let index = 0; index < host.childEntries.length; index++) {
    const entry = host.childEntries[index];
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
      STATIC_SHAPES.set(host, null);
      return null;
    }
    selected[entry.name] = { entry, ids: staticIds(entry), schema };
  }
  const shape = Object.values(selected);
  STATIC_SHAPES.set(host, shape);
  return shape;
};
