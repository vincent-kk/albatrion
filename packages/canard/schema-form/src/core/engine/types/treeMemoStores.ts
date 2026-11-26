/** Tree-owned weak stores; structural types keep this ancestor independent of its children. */
export interface TreeMemoStores {
  deriveTargetIds?: WeakMap<object, number>;
}
