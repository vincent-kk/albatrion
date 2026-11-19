import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import type { FieldNodeRecord } from '../../../record';
import { readFieldNodeErrors } from '../../../validation';
import type { WatchValuesSnapshot } from '../controls/readFieldNodeWatchValues';
import { readFieldNodeWatchValues } from '../controls/readFieldNodeWatchValues';
import { readFieldNodeDefaultValue } from '../loadValues/readFieldNodeDefaultValue';
import { readFieldNodeInactiveValues } from './readFieldNodeInactiveValues';

/**
 * Retain the last committed reads before an exiting node's live path is cleared.
 * @param node - Departing occurrence whose reference remains externally readable
 * @param watchSnapshot - Previous output value and effective schema for watched reads
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
  if (runtime.blueprint.capabilities.hasWatch) {
    runtime.watchValuesMemo?.delete(node);
    readFieldNodeWatchValues(node, watchSnapshot);
  }
  const reads = Object.freeze({
    errors: readFieldNodeErrors(node),
    isMisfit: runtime.misfitPaths.has(node.path),
    misfits: runtime.misfitsMemo?.get(node.path)?.paths ?? EMPTY_ARRAY,
    defaultValue:
      node.behavior.type === 'virtual'
        ? readFieldNodeDefaultValue(node)
        : load
          ? load.value
          : readFieldNodeDefaultValue(node),
    ...(node.behavior.type === 'virtual'
      ? { inactiveValues: readFieldNodeInactiveValues(node) }
      : undefined),
    isVisible: node.isVisible,
    isReadOnly: node.isReadOnly,
    isDisabled: node.isDisabled,
  });
  const detachedReads = runtime.detachedReads ?? new WeakMap();
  runtime.detachedReads = detachedReads;
  detachedReads.set(node, reads);
};
