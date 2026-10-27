import type { FieldNodeRecord } from '../../../record';
import { readFieldNodeErrors } from '../../../validation';
import { readFieldNodeWatchValues } from '../controls/readFieldNodeWatchValues';
import type { WatchValuesSnapshot } from '../controls/readFieldNodeWatchValues';
import { getInactiveValuesState } from '../inactiveValues/getInactiveValuesState';
import { readFieldNodeDefaultValue } from '../loadValues/readFieldNodeDefaultValue';
import { EMPTY_PATHS, EMPTY_VALUES } from './emptyDetachedReads';

/**
 * Retain the last committed reads before an exiting node's live path is cleared.
 * @param node - Departing occurrence whose reference remains externally readable
 * @param watchSnapshot - Previous emission and effective schema for watched reads
 * @param load - The node's load source when the caller already read it, equal to `readFieldNodeDefaultValue(node)`; read here when absent
 * @returns Nothing; the tree runtime retains frozen reads by node identity
 */
export const captureDetachedFieldNodeReads = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
  watchSnapshot: WatchValuesSnapshot,
  load?: { readonly value: unknown },
): void => {
  const runtime = node.runtime;
  runtime.watchValuesMemo?.delete(node);
  readFieldNodeWatchValues(node, watchSnapshot);
  const inactive = getInactiveValuesState(node)?.capture(node.path);
  const heldInactive = inactive
    ? undefined
    : runtime.inactiveValuesMemo.get(node.path);
  const reads = Object.freeze({
    errors: readFieldNodeErrors(node),
    misfit: runtime.misfitPaths.has(node.path),
    misfits: runtime.misfitsMemo?.get(node.path)?.paths ?? EMPTY_PATHS,
    get inactiveValues() {
      return inactive ? inactive() : (heldInactive ?? EMPTY_VALUES);
    },
    defaultValue: load ? load.value : readFieldNodeDefaultValue(node),
    visible: node.visible,
    readOnly: node.readOnly,
    disabled: node.disabled,
  });
  const detachedReads =
    runtime.detachedReads ?? new WeakMap<object, typeof reads>();
  runtime.detachedReads = detachedReads;
  detachedReads.set(node, reads);
};
