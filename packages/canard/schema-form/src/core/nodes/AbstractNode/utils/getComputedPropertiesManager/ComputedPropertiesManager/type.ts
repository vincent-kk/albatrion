/**
 * Public contract of a node's computed-properties holder.
 *
 * Implemented by both the full `ComputedPropertiesManager` (for nodes that
 * actually declare computed/conditional schema) and by the frozen
 * `sharedComputedSentinel` (for the common case of plain nodes). The node tree
 * reads members through this interface, so a computed-free node can skip
 * constructing a real manager entirely — see `needsRealComputedManager`.
 */
export interface ComputedProperties {
  active: boolean;
  visible: boolean;
  readOnly: boolean;
  disabled: boolean;
  oneOfIndex: number;
  anyOfIndices: number[];
  watchValues: any[];
  readonly dependencyPaths: string[];
  readonly dependencies: unknown[];
  readonly isPristineDefined: boolean;
  readonly isDerivedDefined: boolean;
  readonly hasPostProcessor: boolean;
  readonly isEnabled: boolean;
  getDerivedValue(): any;
  getPristine(): boolean | undefined;
  recalculate(): void;
}
