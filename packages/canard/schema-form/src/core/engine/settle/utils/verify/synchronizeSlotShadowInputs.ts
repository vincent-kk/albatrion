import { isPlainObject } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../record';
import type { SlotShadowSession } from '../../types/slotVerification';

/** Presence-only subscription that never executes the caller's listener. */
const SHADOW_LISTENER = () => undefined;

/**
 * Align externally supplied dispatcher inputs before replaying a settlement.
 * @param session - Paired trees retaining their independently calculated sources
 * @returns Nothing; public callback functions are never copied to the oracle
 */
export const synchronizeSlotShadowInputs = <Self extends FieldNodeRecord<Self>>(
  session: SlotShadowSession<Self>,
): void => {
  const actual = session.actual.runtime;
  const shadow = session.shadow.runtime;
  shadow.entryDepth = actual.entryDepth;
  shadow.validationMode = actual.validationMode;
  shadow.validator = actual.validator;
  shadow.unsetOnInactive = actual.unsetOnInactive;
  shadow.disableAutomaticWrites = actual.disableAutomaticWrites;
  shadow.deferMountValidation = actual.deferMountValidation;
  shadow.mountingGuardPass = actual.mountingGuardPass;
  shadow.errorReporter = actual.errorReporter?.hasConsumer()
    ? { hasConsumer: () => true, report: () => undefined }
    : undefined;
  shadow.revisionObserved = actual.revisionObserved;
  const context = session.references.get(actual.context);
  shadow.context = isPlainObject(context) ? context : actual.context;
  const snapshot = actual.loadSnapshot;
  shadow.loadSnapshot =
    snapshot !== null && typeof snapshot === 'object'
      ? (session.references.get(snapshot) ?? snapshot)
      : snapshot;
  shadow.chainErrors = actual.chainErrors ? [...actual.chainErrors] : undefined;
  shadow.chainOccurrences = actual.chainOccurrences
    ? [...actual.chainOccurrences]
    : undefined;
  const globalState = session.references.get(actual.globalState);
  shadow.globalState =
    isPlainObject<Record<string, true>>(globalState) &&
    Object.values(globalState).every((value) => value === true)
      ? globalState
      : actual.globalState;
  shadow.globalStateCounts = new Map();
  shadow.globalErrors = actual.globalErrors;
  shadow.routedValidationErrors = actual.routedValidationErrors;
  shadow.validationResult = actual.validationResult;
  shadow.validationStamp = actual.validationStamp;
  shadow.listeners = actual.listeners ? new Map() : undefined;
  shadow.nodeErrors = actual.nodeErrors ? new Map() : undefined;
  shadow.validationErrors = actual.validationErrors ? new Map() : undefined;
  shadow.deliveries = new Set();
  for (const [node, baseline] of session.nodes) {
    const interactionState = session.references.get(node.interactionState);
    baseline.interactionState = isPlainObject(interactionState)
      ? interactionState
      : node.interactionState;
    if (!baseline.detached)
      for (const key of Object.keys(baseline.interactionState))
        if (baseline.interactionState[key])
          shadow.globalStateCounts.set(
            key,
            (shadow.globalStateCounts.get(key) ?? 0) + 1,
          );
    baseline.interactionReset = node.interactionReset;
    baseline.revisionLedger = node.revisionLedger;
    baseline.pendingRevision = node.pendingRevision;
    if (!node.pendingDelivery) baseline.pendingDelivery = undefined;
    else if (baseline.pendingDelivery) shadow.deliveries.add(baseline);
    baseline.pendingNonSettleDelivery = node.pendingNonSettleDelivery;
    if (actual.listeners?.get(node)?.size)
      shadow.listeners?.set(baseline, new Set([SHADOW_LISTENER]));
    const external = actual.nodeErrors?.get(node);
    if (external) shadow.nodeErrors?.set(baseline, external);
    const validation = actual.validationErrors?.get(node);
    if (validation) shadow.validationErrors?.set(baseline, validation);
  }
};
