/** Public getter channels compared with persistent reference relations. */
export const SLOT_SHADOW_PUBLIC_CHANNELS = [
  'raw',
  'undeclaredValues',
  'value',
  'outputValue',
  'inactiveValues',
  'defaultValue',
  'jsonSchema',
  'state',
  'globalState',
  'errors',
  'globalErrors',
  'watchValues',
  'misfit',
  'misfits',
  'diagnostics',
  'context',
  'active',
  'visible',
  'enabled',
  'readOnly',
  'disabled',
  'required',
  'nullable',
  'type',
  'strategy',
  'name',
  'escapedName',
  'path',
  'depth',
  'isRoot',
  'rootNode',
  'parentNode',
  'children',
] as const;

/** Internal channels backing public delivery and retained lifetime behavior. */
export const SLOT_SHADOW_RECORD_CHANNELS = [
  'detached',
  'disposed',
  'interactionReset',
  'pendingDelivery',
  'pendingNonSettleDelivery',
] as const;

/** Runtime observations whose object identity is not a public contract. */
export const SLOT_SHADOW_RUNTIME_CHANNELS = [
  'diagnostics',
  'misfitRecords',
  'chainErrors',
  'chainOccurrences',
] as const;
