import type { FieldNodeRecord } from '../../../record';

/** Drop undelivered work from an interrupted chain without undoing committed values. */
export const discardFieldNodeChainWork = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  for (const node of runtime.deliveries ?? []) node.pendingDelivery = undefined;
  for (const node of runtime.queuedNonSettleEvents ?? [])
    node.pendingNonSettleDelivery = undefined;
  runtime.deliveries = undefined;
  runtime.queuedNonSettleEvents = undefined;
  runtime.pendingExternalErrorNodes = undefined;
  runtime.pendingWarningRecords = undefined;
  runtime.guardFailureRecords = undefined;
  runtime.hasStateChanged = false;
  if (runtime.isValidationPending)
    runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationPendingTargets = undefined;
  runtime.runValidation = undefined;
  runtime.validationRequestStamp = undefined;
  runtime.validationPendingEntryStamp = undefined;
  runtime.validationTargets = undefined;
  runtime.shouldDeferLoadValidation = undefined;
};
