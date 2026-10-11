import type { Blueprint } from '../../type';
import { collectDeriveConvergenceTargets } from '../analyze/collectDeriveConvergenceTargets';

/** First-write proof consumed by settle; no public Blueprint slots are added. */
export class DeriveConvergenceTargets {
  /** Null memoizes conservative fallback for the immutable analysis lifetime. */
  private static readonly targets = new WeakMap<Blueprint, ReadonlySet<string> | null>();

  /**
   * Retain proven targets, or disable skipping for a reference run.
   * @param blueprint - Immutable analysis owning this proof
   * @param targets - Static disjoint paths; undefined restores normal confirmation
   * @returns Nothing; updates the weak compiler sidecar
   */
  static set(blueprint: Blueprint, targets: ReadonlySet<string> | undefined): void {
    this.targets.set(blueprint, targets ?? null);
  }

  /**
   * Observe the proof without triggering its first-write collection.
   * @param blueprint - Immutable analysis used by the current form
   * @returns Proven paths, or undefined for conservative fallback
   */
  static get(blueprint: Blueprint): ReadonlySet<string> | undefined {
    return this.targets.get(blueprint) ?? undefined;
  }

  /**
   * Collect once when a derive round first needs a proof, including fallback.
   * @param blueprint - Immutable analysis shared by forms of the same schema
   * @returns Proven paths, or undefined for conservative fallback
   */
  static getOrCollect(blueprint: Blueprint): ReadonlySet<string> | undefined {
    const cached = this.targets.get(blueprint);
    if (cached !== undefined) return cached ?? undefined;
    const targets = collectDeriveConvergenceTargets(blueprint);
    this.set(blueprint, targets);
    return targets;
  }
}
