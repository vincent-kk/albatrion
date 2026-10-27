// Internal modes are runtime-owned; only explicit verify bundles enable the oracle.
import type { FieldNodeRecord } from '../../../record';
import { engineModes } from '../../../utils/cache/engineModes';
import type { SettlementContext } from '../../types/settlement';
import { InactiveValuesState } from '../inactiveValues/InactiveValuesState';
import { captureInactiveOracle } from '../inactiveValues/captureInactiveOracle';
import { getInactiveValuesState } from '../inactiveValues/getInactiveValuesState';
import { rebuildInactiveValuesMemo } from './rebuildInactiveValuesMemo';
import { verifyInactiveValuesMemo } from './verifyInactiveValuesMemo';

/**
 * Record only the committed latent delta, rebuilding on wholesale changes.
 * @param root - Final live shape and root-owned source stores
 * @param context - Completed entry, exit and load facts
 * @returns Nothing; host arrays remain deferred until their first read
 */
export const updateInactiveValuesMemo = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  context?: SettlementContext<Self>,
): void => {
  const runtime = root.runtime;
  let state = getInactiveValuesState(root);
  if (!runtime.latentRawDirty && (state || runtime.inactiveValuesMemo.has('')))
    return;
  const oracle =
    engineModes.inactiveValues === 'verify'
      ? captureInactiveOracle(root)
      : undefined;
  const rebuild =
    !state ||
    runtime.inactiveValuesRebuild ||
    context?.kind === 'load' ||
    engineModes.inactiveValues === 'rebuild' ||
    (runtime.latentRawDirty && !runtime.inactiveValueChanges?.size);
  if (rebuild) {
    if (state) {
      state.publishAll();
      state.busy = true;
    }
    try {
      runtime.latentRawDirty = true;
      rebuildInactiveValuesMemo(root);
      if (state) state.reset();
      else if (engineModes.inactiveValues !== 'rebuild')
        runtime.inactiveValuesState = state = new InactiveValuesState(root);
    } finally {
      if (state) state.busy = false;
    }
  } else {
    state!.append(context);
    for (const key of runtime.inactiveValueChanges ?? [])
      if (!runtime.latentRaw.has(key)) runtime.latentRawMetadata?.delete(key);
    runtime.latentRawDirty = false;
  }
  runtime.inactiveValueChanges?.clear();
  runtime.inactiveValuesRebuild = false;
  if (oracle) verifyInactiveValuesMemo(root, oracle);
};
