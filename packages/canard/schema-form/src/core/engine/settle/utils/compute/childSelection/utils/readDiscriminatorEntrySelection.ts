import { mergeEffectiveSchema } from '../../../../../blueprint';
import type {
  BlueprintChildEntry,
  BlueprintOptions,
} from '../../../../../blueprint';
import { mergeGateSteps } from '../gateSelection/mergeGateSteps';
import type {
  DiscriminatorEntrySelection,
  PreparedDiscriminatorEntry,
} from './prepareDiscriminatorEntrySelection';

/** All unknown or non-primitive tags share one stable no-match bucket. */
const EMPTY_BUCKET: readonly number[] = Object.freeze([]);

/**
 * Read or prepare one tag's ordered IDs and schema without retaining input values.
 * @param entry - Proven stable hoisted discriminator candidate
 * @param selection - Host-plan metadata whose buckets own the cache lifetime
 * @param value - Current projected tag, compared without coercion
 * @param isAtomic - Immutable blueprint's atomic-schema predicate
 * @returns The same prepared record for repeated reads of one static bucket
 */
export const readDiscriminatorEntrySelection = (
  entry: BlueprintChildEntry,
  selection: DiscriminatorEntrySelection,
  value: unknown,
  isAtomic: BlueprintOptions['isAtomic'],
): PreparedDiscriminatorEntry => {
  const bucket = selection.buckets.get(value) ?? EMPTY_BUCKET;
  const cached = selection.prepared.get(bucket);
  if (cached) return cached;
  const ids = mergeGateSteps(selection.baseline, bucket).map(
    (index) => entry.declarations[index].id,
  );
  const schema = mergeEffectiveSchema(entry.node, ids, {
    mode: 'runtime',
    isAtomic,
  });
  const prepared = { ids, schema };
  selection.prepared.set(bucket, prepared);
  return prepared;
};
