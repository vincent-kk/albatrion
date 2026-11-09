import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import {
  releaseFieldNodeRevealHistory,
  routeValidationIssues,
  transitionFieldNodeValidation,
} from '../../../validation';
import { deliverValidationWave } from '../chain/deliverValidationWave';

/**
 * Commit scalar defaults and display policy without rebuilding or settling values.
 * @param root - Current root; an open chain defers the latest settings until it closes.
 * @param settings - Complete write defaults and raw validation mode, with an optional opaque display policy.
 * @param onModeChange - Binding callback that replaces its shared load/activation slot after application.
 * @returns Nothing; None clears validator issues through the existing error event channel.
 */
export const dispatchUpdateSettings = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  settings: Pick<
    Self['runtime'],
    'validationMode' | 'unsetOnInactive' | 'disableAutomaticWrites'
  > & { errorVisibility?: unknown },
  onModeChange?: () => void,
): void => {
  if (root.disposed) return;
  const runtime = root.runtime;
  if (
    runtime.entryDepth ||
    runtime.chainRoot ||
    runtime.chainErrors ||
    runtime.flushingQueuedEvents ||
    runtime.reportingErrors
  ) {
    runtime.pendingSettings = () =>
      dispatchUpdateSettings(root, settings, onModeChange);
    return;
  }
  runtime.unsetOnInactive = settings.unsetOnInactive;
  runtime.disableAutomaticWrites = settings.disableAutomaticWrites;
  const policy = hasOwnProperty(settings, 'errorVisibility')
    ? settings.errorVisibility
    : runtime.revealPolicy?.value;
  if (!transitionFieldNodeValidation(root, settings.validationMode, policy))
    return;
  const epoch = runtime.validationEpoch;
  if (settings.validationMode === ValidationMode.None) {
    if (
      runtime.validationErrors?.size ||
      runtime.routedValidationErrors?.length
    )
      routeValidationIssues([root], EMPTY_ARRAY);
    runtime.validationResult = undefined;
  }
  onModeChange?.();
  releaseFieldNodeRevealHistory(root);
  if (
    runtime.validationEpoch === epoch &&
    settings.validationMode === ValidationMode.None
  )
    deliverValidationWave(root, EMPTY_ARRAY, runtime.commitNumber ?? 0);
};
