import type { Optional } from '@aileron/declare';

import { mergeEffectiveSchema } from '../../../../blueprint';
import type {
  BlueprintChildEntry,
  BlueprintNode,
  BlueprintOptions,
  EffectiveSchema,
} from '../../../../blueprint';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';
import { staticIds } from './staticIds';

/** Runtime merge and conflict verdict of one edge whose declarations are all admitted. */
interface AdmittedEdgeSchema {
  /** Effective schema merged from every declaration of the edge. */
  readonly schema: EffectiveSchema;
  /** Whether the merge reported an empty type intersection. */
  readonly conflict: boolean;
  /** Atomic-value predicate identity the merge received. */
  readonly isAtomic: BlueprintOptions['isAtomic'];
}

/** Merge results belong to the analyzed child edge; live records are never retained. */

/**
 * Read the constant schema and conflict of a child edge whose every declaration is admitted.
 * Gates are still evaluated by the caller; this only skips re-merging static data.
 * @param entry - Analyzed child edge, all of whose declarations the current pass admitted
 * @param node - Blueprint node of the live child selected for the edge
 * @param isAtomic - Atomic-value predicate the runtime merge passes
 * @param owner - Immutable parent host that declared this entry
 * @returns The edge's merge result and conflict verdict, or undefined when the child was
 * created from another edge's node and the caller must merge for that node
 */
export const readAdmittedEdgeSchema = (
  entry: BlueprintChildEntry,
  node: BlueprintNode,
  isAtomic: BlueprintOptions['isAtomic'],
  owner: BlueprintNode,
): Optional<AdmittedEdgeSchema> => {
  if (node !== entry.node) return undefined;
  const record = getHostDerived<
    'admittedEdgeSchemas',
    WeakMap<BlueprintChildEntry, AdmittedEdgeSchema>
  >(owner);
  const entries = (record.admittedEdgeSchemas ??= new WeakMap());
  const cached = entries.get(entry);
  if (cached && cached.isAtomic === isAtomic) return cached;
  const schema = mergeEffectiveSchema(entry.node, staticIds(entry, owner), {
    mode: 'runtime',
    isAtomic,
  });
  const admitted: AdmittedEdgeSchema = {
    schema,
    conflict: schema.typeConflict,
    isAtomic,
  };
  entries.set(entry, admitted);
  return admitted;
};
