import type { Blueprint } from '../types/blueprint';

/** Creation evidence belongs to the immutable analysis, outside derived records. */
export class StaticFirstLoadCapability {
  /** Read the fixed proof without scanning declarations or allocating storage. */
  static has(blueprint: Blueprint): boolean {
    return blueprint.staticFirstLoadEligible === true;
  }
}
