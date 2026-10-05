import type { Blueprint } from '../../type';

/** Creation-time proof consumed by settle; no public Blueprint slots are added. */
export class DeriveConvergenceTargets {
  /** Paths retained only for the immutable analysis lifetime. */
  private static readonly targets = new WeakMap<Blueprint, ReadonlySet<string>>();

  /**
   * Retain proven targets for creation, or disable skipping for a reference run.
   * @param blueprint - Immutable analysis owning this proof
   * @param targets - Static disjoint paths; undefined restores normal confirmation
   * @returns Nothing; updates the weak compiler sidecar
   */
  static set(blueprint: Blueprint, targets: ReadonlySet<string> | undefined): void {
    if (targets) this.targets.set(blueprint, targets);
    else this.targets.delete(blueprint);
  }

  /**
   * Read the proof without scanning declarations during settlement.
   * @param blueprint - Immutable analysis used by the current form
   * @returns Proven paths, or undefined for conservative fallback
   */
  static get(blueprint: Blueprint): ReadonlySet<string> | undefined {
    return this.targets.get(blueprint);
  }
}
