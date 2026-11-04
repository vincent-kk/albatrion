import type { Nullable, Optional } from '@aileron/declare';

import { getBlueprintDerived } from '../../../utils/cache/derivedRecords';
import type { Blueprint } from '../../types/blueprint';
import { collectDeriveConvergenceTargets } from './collectDeriveConvergenceTargets';

/** First-write proof consumed by settle; no public Blueprint slots are added. */
export class DeriveConvergenceTargets {
  /** Null memoizes conservative fallback for the immutable analysis lifetime. */

  /**
   * Retain proven targets, or disable skipping for a reference run.
   * @param blueprint - Immutable analysis owning this proof
   * @param targets - Static disjoint paths; undefined restores normal confirmation
   * @returns Nothing; updates the weak compiler sidecar
   */
  static set(
    blueprint: Blueprint,
    targets: Optional<ReadonlySet<string>>,
  ): void {
    getBlueprintDerived<
      'deriveConvergenceTargets',
      Nullable<ReadonlySet<string>>
    >(blueprint).deriveConvergenceTargets = targets ?? null;
  }

  /**
   * Observe the proof without triggering its first-write collection.
   * @param blueprint - Immutable analysis used by the current form
   * @returns Proven paths, or undefined for conservative fallback
   */
  static get(blueprint: Blueprint): Optional<ReadonlySet<string>> {
    return (
      getBlueprintDerived<
        'deriveConvergenceTargets',
        Nullable<ReadonlySet<string>>
      >(blueprint).deriveConvergenceTargets ?? undefined
    );
  }

  /**
   * Collect once when a derive round first needs a proof, including fallback.
   * @param blueprint - Immutable analysis shared by forms of the same schema
   * @returns Proven paths, or undefined for conservative fallback
   */
  static getOrCollect(blueprint: Blueprint): Optional<ReadonlySet<string>> {
    const cached = getBlueprintDerived<
      'deriveConvergenceTargets',
      Nullable<ReadonlySet<string>>
    >(blueprint).deriveConvergenceTargets;
    if (cached !== undefined) return cached ?? undefined;
    const targets = collectDeriveConvergenceTargets(blueprint);
    this.set(blueprint, targets);
    return targets;
  }
}
