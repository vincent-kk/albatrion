/** Independently filled BlueprintDerived slots; concrete value types stay with their builders. */
export interface BlueprintDerived {
  deriveRuleTable?: unknown;
  featureNodeIndex?: unknown;
  deriveConvergenceTargets?: unknown;
  gateBudgetIndex?: unknown;
  gateExpressions?: unknown;
  ifGateReadNames?: unknown;
  exitPolicyExpressions?: unknown;
  dependencyIndex?: unknown;
  contextOwners?: unknown;
  virtualReferenceIndex?: unknown;
  recursiveExpansion?: unknown;
  recursiveRelativeSpan?: unknown;
  independentLeafDefaults?: unknown;
  splitOwnersPrepared?: unknown;
  controlExpressions?: unknown;
}
/** Independently filled HostDerived slots; concrete value types stay with their builders. */
export interface HostDerived {
  /** Bounded concrete syntax owned by a runtime; values never contain live lookups. */
  pointerSegments?: unknown;
  /** Authored dependency syntax witnessed by one actual host path. */
  stateDependencyPlans?: unknown;
  /** Definition witnesses for the node/commit watch memo; never select a watch list. */
  watchValuesWitness?: unknown;
  wheelPlan?: unknown;
  preparedStaticHost?: unknown;
  /** Live occurrence source-scope writer selected from its fixed lineage. */
  sourcePruner?: unknown;
  controlLayerIndex?: unknown;
  childOrderIndex?: unknown;
  watchPaths?: unknown;
  deriveChildren?: unknown;
  declaredNames?: unknown;
  declarationIds?: unknown;
  objectChildren?: unknown;
  readPlans?: unknown;
  staticGateList?: unknown;
  gateSelectionTable?: unknown;
  directChildSelectionPlan?: unknown;
  staticShape?: unknown;
  staticIds?: unknown;
  admittedEdgeSchemas?: unknown;
  staticObjectEntries?: unknown;
  itemEntries?: unknown;
  defaultEffectiveSchema?: unknown;
  effectiveSchemaMemo?: unknown;
  staticPartition?: unknown;
}

type SlotValue<Record, Slot extends keyof Record, Value> = Omit<
  Record,
  Slot
> & { [Key in Slot]?: Value };
/** Keys are immutable analyses/templates; owners fill only the requested property. */
let blueprintRecords = new WeakMap<object, BlueprintDerived>();
let hostRecords = new WeakMap<object, HostDerived>();

/** Read one analysis record without preparing any slot. */
export const getBlueprintDerived = <
  Slot extends keyof BlueprintDerived = never,
  Value = never,
>(
  blueprint: object,
): SlotValue<BlueprintDerived, Slot, Value> => {
  let record = blueprintRecords.get(blueprint);
  if (!record) {
    record = {};
    blueprintRecords.set(blueprint, record);
  }
  return record as SlotValue<BlueprintDerived, Slot, Value>;
};

/** Inspect an existing host record without creating a record or preparing a slot. */
export const peekHostDerived = <
  Slot extends keyof HostDerived = never,
  Value = never,
>(
  host: object,
): SlotValue<HostDerived, Slot, Value> | undefined =>
  hostRecords.get(host) as SlotValue<HostDerived, Slot, Value> | undefined;

/** Read one host record without preparing any slot. */
export const getHostDerived = <
  Slot extends keyof HostDerived = never,
  Value = never,
>(
  host: object,
): SlotValue<HostDerived, Slot, Value> => {
  let record = hostRecords.get(host);
  if (!record) {
    record = {};
    hostRecords.set(host, record);
  }
  return record as SlotValue<HostDerived, Slot, Value>;
};

/** Only mode transitions replace the two roots; creation facts are not stored here. */
export const resetEngineDerivedRecords = (): void => {
  blueprintRecords = new WeakMap<object, BlueprintDerived>();
  hostRecords = new WeakMap<object, HostDerived>();
};
