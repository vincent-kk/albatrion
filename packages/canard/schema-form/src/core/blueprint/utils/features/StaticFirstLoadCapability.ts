import type { Blueprint } from '../../type';

/** Internal compiler evidence; the public Blueprint shape remains unchanged. */
export class StaticFirstLoadCapability {
  private static readonly eligibility = new WeakMap<Blueprint, boolean>();

  /** Retain the completed declaration/shape proof for one immutable blueprint. */
  static set(blueprint: Blueprint, eligible: boolean): void {
    this.eligibility.set(blueprint, eligible);
  }

  /** Read compiler evidence without scanning declarations at load time. */
  static has(blueprint: Blueprint): boolean {
    return this.eligibility.get(blueprint) === true;
  }
}
