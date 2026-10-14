import type { FieldNodeRecord } from '../../../record';
import { readFieldNodeErrors } from '../../../validation';
import { readFieldNodeWatchValues } from '../controls/readFieldNodeWatchValues';
import type { WatchValuesSnapshot } from '../controls/readFieldNodeWatchValues';
import { readFieldNodeDefaultValue } from '../load/readFieldNodeDefaultValue';
import { EMPTY_PATHS, EMPTY_VALUES } from './emptyDetachedReads';

/**
 * Retain the last committed reads before an exiting node's live path is cleared.
 * @param node - Departing occurrence whose reference remains externally readable
 * @param watchSnapshot - Previous emission and effective schema for watched reads
 * @returns Nothing; the tree runtime retains frozen reads by node identity
 */
export const captureDetachedFieldNodeReads = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
  watchSnapshot: WatchValuesSnapshot,
): void => {
  const runtime = node.runtime;
  runtime.watchValuesMemo?.delete(node);
  readFieldNodeWatchValues(node, watchSnapshot);
  const reads = Object.freeze({
    errors: readFieldNodeErrors(node),
    misfit: runtime.misfitPaths.has(node.path),
    misfits: runtime.misfitsMemo?.get(node.path)?.paths ?? EMPTY_PATHS,
    inactiveValues: runtime.inactiveValuesMemo.get(node.path) ?? EMPTY_VALUES,
    defaultValue: readFieldNodeDefaultValue(node),
    visible: node.visible,
    readOnly: node.readOnly,
    disabled: node.disabled,
  });
  const detachedReads =
    runtime.detachedReads ?? new WeakMap<object, typeof reads>();
  runtime.detachedReads = detachedReads;
  detachedReads.set(node, reads);
};
