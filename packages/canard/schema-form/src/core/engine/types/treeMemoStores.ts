/** Tree-owned weak stores; structural types keep this ancestor independent of its children. */
export interface TreeMemoStores<Entry = unknown, Gate = unknown> {
  committedDeclarationKeys?: WeakMap<
    object,
    { path: string; kind: string; key: string; schemaType?: unknown }
  >;
  deriveTargetIds?: WeakMap<object, number>;
  /** State, retained across every reset while old references own their runtime. */
  detachedWriteAddresses?: WeakMap<
    object,
    { path: string; order: readonly number[] }
  >;
  arrayShapes?: WeakMap<
    object,
    {
      children: readonly unknown[];
      schema: unknown;
      undeclaredValues: unknown;
      raw: unknown;
      itemCount: number;
    }
  >;
  objectShapes?: WeakMap<
    object,
    {
      children: readonly unknown[];
      schema: unknown;
      undeclaredValues: unknown;
      names: readonly string[];
    }
  >;
  hostBudgetCaps?: WeakMap<object, { gates: readonly Gate[]; cap: number }>;
  arrayChildEntries?: WeakMap<
    object,
    { count: number; result: readonly Entry[] }
  >;
}
