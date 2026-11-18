/** Weak ownership of unpublished value payloads; the pending event owns their lifetime. */
export const pendingBatchValuePayloads = new WeakMap<
  object,
  { previous: unknown; current: unknown }
>();
