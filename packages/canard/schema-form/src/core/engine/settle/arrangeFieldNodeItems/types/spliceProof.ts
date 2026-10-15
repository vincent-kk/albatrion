import type { BlueprintChildEntry, EffectiveSchema } from '../../../blueprint';
import type { ArrayArrangePlan, FieldNodeRecord } from '../../../record';

/** Call-local evidence of one admitted static middle remove or insert; it never outlives its settlement. */
export interface ArraySpliceProof<Self extends FieldNodeRecord<Self>> {
  /** Live static branch array whose tail from `index` is re-keyed. */
  host: Self;
  /** Item count before the splice. */
  count: number;
  /** Removed or inserted position; positions before it keep their nodes, keys and slots. */
  index: number;
  /** Analyzed child edge of the inserted position; absent for a removal. */
  entry?: BlueprintChildEntry;
  /** Static effective schema the inserted child must carry; absent for a removal. */
  schema?: EffectiveSchema;
  /** Proposal reporting the removed value or the new length; an insert's only slot carries its value. */
  plan: Extract<ArrayArrangePlan, { kind: 'slots' }>;
}
