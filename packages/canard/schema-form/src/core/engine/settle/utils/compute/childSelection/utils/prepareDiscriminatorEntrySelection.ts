import type {
  BlueprintChildEntry,
  EffectiveSchema,
} from '../../../../../blueprint';

/** Immutable IDs and schema for one encountered strict tag bucket. */
export interface PreparedDiscriminatorEntry {
  /** Active and baseline declaration IDs in their original authored order. */
  readonly ids: readonly number[];
  /** Pure effective schema, shared after the bucket's first encounter. */
  readonly schema: EffectiveSchema;
}

/** Tag selection metadata owned by the immutable host's direct plan. */
export interface DiscriminatorEntrySelection {
  /** Ungated positions included for every tag, including an unknown value. */
  readonly baseline: readonly number[];
  /** Strict primitive tags to matching gated declaration positions. */
  readonly buckets: ReadonlyMap<unknown, readonly number[]>;
  /** Lazy pure schema preparation keyed by static buckets, never caller values. */
  readonly prepared: WeakMap<readonly number[], PreparedDiscriminatorEntry>;
}

/**
 * Compile a proven stable hoisted tag's declarations without evaluating gates.
 * @param entry - Candidate accepted by isStableDiscriminatorEntry
 * @returns Shared baseline, authored tag buckets, and empty lazy schema preparation
 */
export const prepareDiscriminatorEntrySelection = (
  entry: BlueprintChildEntry,
): DiscriminatorEntrySelection => {
  const baseline: number[] = [];
  const buckets = new Map<unknown, number[]>();
  for (let index = 0; index < entry.declarations.length; index++) {
    const declaration = entry.declarations[index];
    const first = declaration.gates[0];
    if (!first) {
      baseline.push(index);
      continue;
    }
    if (first.kind !== 'discriminator') continue;
    for (let tag = 0; tag < first.condition.values.length; tag++) {
      const value = first.condition.values[tag];
      if (first.condition.values.indexOf(value) !== tag) continue;
      let admitted = true;
      for (const gate of declaration.gates) {
        if (gate.kind !== 'discriminator') {
          admitted = false;
          break;
        }
        let matches = false;
        const values = gate.condition.values;
        for (let index = 0, count = values.length; index < count; index++)
          if (index in values && values[index] === value) {
            matches = true;
            break;
          }
        if (!matches) {
          admitted = false;
          break;
        }
      }
      if (!admitted) continue;
      const bucket = buckets.get(value);
      if (bucket) bucket.push(index);
      else buckets.set(value, [index]);
    }
  }
  return { baseline, buckets, prepared: new WeakMap() };
};
