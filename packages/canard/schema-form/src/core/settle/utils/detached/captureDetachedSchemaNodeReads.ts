import type { SchemaNodeRecord } from '../../../record';
import { readSchemaNodeDefaultValue } from '../load/readSchemaNodeDefaultValue';
import { EMPTY_PATHS, EMPTY_VALUES } from './emptyDetachedReads';

/** Retain the last committed reads before an exiting node's live path is cleared. */
export const captureDetachedSchemaNodeReads = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): void => {
  const runtime = node.runtime;
  const reads = Object.freeze({
    typeMismatch: runtime.typeMismatchPaths.has(node.path),
    typeMismatches: runtime.typeMismatchesMemo?.get(node.path)?.paths ?? EMPTY_PATHS,
    inactiveValues: runtime.inactiveValuesMemo.get(node.path) ?? EMPTY_VALUES,
    defaultValue: readSchemaNodeDefaultValue(node),
  });
  const detachedReads = runtime.detachedReads ?? new WeakMap<object, typeof reads>();
  runtime.detachedReads = detachedReads;
  detachedReads.set(node, reads);
};
