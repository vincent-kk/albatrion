import type { SchemaNodeRecord } from '../../../record';
import { readSchemaNodeDefaultValue } from '../load/readSchemaNodeDefaultValue';
import { readSchemaNodeWatchValues } from '../controls/readSchemaNodeWatchValues';
import type { WatchValuesSnapshot } from '../controls/readSchemaNodeWatchValues';
import { EMPTY_PATHS, EMPTY_VALUES } from './emptyDetachedReads';

/**
 * Retain the last committed reads before an exiting node's live path is cleared.
 * @param node - Departing occurrence whose reference remains externally readable
 * @param watchSnapshot - Previous emission and effective schema for watched reads
 * @returns Nothing; the tree runtime retains frozen reads by node identity
 */
export const captureDetachedSchemaNodeReads = <Self extends SchemaNodeRecord<Self>>(
  node: Self, watchSnapshot: WatchValuesSnapshot,
): void => {
  const runtime = node.runtime;
  runtime.watchValuesMemo?.delete(node);
  readSchemaNodeWatchValues(node, watchSnapshot);
  const reads = Object.freeze({
    typeMismatch: runtime.typeMismatchPaths.has(node.path),
    typeMismatches: runtime.typeMismatchesMemo?.get(node.path)?.paths ?? EMPTY_PATHS,
    inactiveValues: runtime.inactiveValuesMemo.get(node.path) ?? EMPTY_VALUES,
    defaultValue: readSchemaNodeDefaultValue(node),
    visible: node.visible,
    readOnly: node.readOnly,
    disabled: node.disabled,
  });
  const detachedReads = runtime.detachedReads ?? new WeakMap<object, typeof reads>();
  runtime.detachedReads = detachedReads;
  detachedReads.set(node, reads);
};
