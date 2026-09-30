import type { SchemaNodeRecord } from '../../record';
import { readSchemaNodeDefaultValue } from './load/readSchemaNodeDefaultValue';

const EMPTY_PATHS: readonly string[] = Object.freeze([]);
const EMPTY_VALUES: readonly { path: string; value: unknown }[] = Object.freeze([]);

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

/** Read the current or final committed mismatch lamp for one reference. */
export const readSchemaNodeTypeMismatch = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): boolean => node.detached
  ? node.runtime.detachedReads?.get(node)?.typeMismatch ?? false
  : node.runtime.typeMismatchPaths.has(node.path);

/** Read the current or final committed mismatch paths for one reference. */
export const readSchemaNodeTypeMismatches = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): readonly string[] => node.detached
  ? node.runtime.detachedReads?.get(node)?.typeMismatches ?? EMPTY_PATHS
  : node.runtime.typeMismatchesMemo?.get(node.path)?.paths ?? EMPTY_PATHS;

/** Read the current or final committed inactive values for one reference. */
export const readSchemaNodeInactiveValues = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): readonly { path: string; value: unknown }[] => node.detached
  ? node.runtime.detachedReads?.get(node)?.inactiveValues ?? EMPTY_VALUES
  : node.runtime.inactiveValuesMemo.get(node.path) ?? EMPTY_VALUES;
