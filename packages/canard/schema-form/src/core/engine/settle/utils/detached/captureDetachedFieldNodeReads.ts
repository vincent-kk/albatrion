import type { FieldNodeRecord } from '../../../record';
import { readFieldNodeErrors } from '../../../validation';
import type { WatchValuesSnapshot } from '../controls/readFieldNodeWatchValues';
import { readFieldNodeWatchValues } from '../controls/readFieldNodeWatchValues';
import { getDependencyIndex } from '../dependencies/getDependencyIndex';
import { getLoadValue } from '../loadValues/getLoadValue';
import { EMPTY_PATHS } from './emptyDetachedReads';

/**
 * Retain the last committed reads before an exiting node's live path is cleared.
 * Keep prepared static syntax for this one-use read; the runtime cache serves live paths.
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
  if (runtime.blueprint.capabilities.hasWatch) {
    runtime.watchValuesMemo?.delete(node);
    readFieldNodeWatchValues(node, watchSnapshot);
  }
  const reads = Object.freeze({
    errors: readFieldNodeErrors(node),
    isMisfit: runtime.misfitPaths.has(node.path),
    misfits: runtime.misfitsMemo?.get(node.path)?.paths ?? EMPTY_PATHS,
    defaultValue: load
      ? load.value
      : node.detached
        ? runtime.detachedReads?.get(node)?.defaultValue
        : runtime.blueprint.capabilities.branchless
          ? getLoadValue(runtime.loadSnapshot, node.path)
          : getLoadValue(
              runtime.loadSnapshot,
              node.path,
              getDependencyIndex(runtime.blueprint).pathSegments(node.path),
            ),
    isVisible: node.isVisible,
    isReadOnly: node.isReadOnly,
    isDisabled: node.isDisabled,
  });
  const detachedReads =
    runtime.detachedReads ?? new WeakMap<object, typeof reads>();
  runtime.detachedReads = detachedReads;
  detachedReads.set(node, reads);
};
