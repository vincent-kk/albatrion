import { mergeEffectiveSchema } from '../../../../blueprint';
import type {
  BlueprintChildEntry,
  BlueprintNode,
  BlueprintOptions,
  EffectiveSchema,
} from '../../../../blueprint';
import { registerEngineDerivedReset } from '../../../../utils/cache/engineModes';
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
let ADMITTED_EDGE_SCHEMAS = new WeakMap<
  BlueprintChildEntry,
  AdmittedEdgeSchema
>();
registerEngineDerivedReset(() => {
  ADMITTED_EDGE_SCHEMAS = new WeakMap<
    BlueprintChildEntry,
    AdmittedEdgeSchema
  >();
});

/**
 * Read the constant schema and conflict of a child edge whose every declaration is admitted.
 * Gates are still evaluated by the caller; this only skips re-merging static data.
 * @param entry - Analyzed child edge, all of whose declarations the current pass admitted
 * @param node - Blueprint node of the live child selected for the edge
 * @param isAtomic - Atomic-value predicate the runtime merge passes
 * @returns The edge's merge result and conflict verdict, or undefined when the child was
 * created from another edge's node and the caller must merge for that node
 */
export const readAdmittedEdgeSchema = (
  entry: BlueprintChildEntry,
  node: BlueprintNode,
  isAtomic: BlueprintOptions['isAtomic'],
): AdmittedEdgeSchema | undefined => {
  if (node !== entry.node) return undefined;
  const cached = ADMITTED_EDGE_SCHEMAS.get(entry);
  if (cached && cached.isAtomic === isAtomic) return cached;
  const schema = mergeEffectiveSchema(entry.node, staticIds(entry), {
    mode: 'runtime',
    isAtomic,
  });
  const admitted: AdmittedEdgeSchema = {
    schema,
    conflict: schema.typeConflict,
    isAtomic,
  };
  ADMITTED_EDGE_SCHEMAS.set(entry, admitted);
  return admitted;
};
