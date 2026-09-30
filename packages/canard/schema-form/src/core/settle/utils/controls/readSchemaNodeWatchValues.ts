import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNodeRecord } from '../../../record';
import type { BlueprintSchema } from '../../../blueprint';
import { readStateDependency } from './readStateDependency';
import type { EmissionSnapshot } from './readStateDependency';

/** Rule-free nodes share one immutable empty result. */
const EMPTY_WATCH_VALUES: readonly unknown[] = Object.freeze([]);

/** Final effective schema and emitted inputs from the preceding commit. */
export interface WatchValuesSnapshot extends EmissionSnapshot {
  /** Effective schema before the departing node's last settlement. */
  readonly schema: BlueprintSchema;
}

/**
 * Read effective watch paths from emitted values, once per node and commit.
 * @param node - Live or detached occurrence with an effective schema
 * @param snapshot - Pre-settlement values captured when a node leaves
 * @returns Stable watched values for this commit or the detached snapshot
 */
export const readSchemaNodeWatchValues = <Self extends SchemaNodeRecord<Self>>(
  node: Self, snapshot?: WatchValuesSnapshot,
): readonly unknown[] => {
  const runtime = node.runtime;
  const commit = runtime.commitNumber ?? 0;
  const memo = runtime.watchValuesMemo?.get(node);
  if (!snapshot && memo && (node.detached || memo.commit === commit)) return memo.values;
  if (node.detached) return EMPTY_WATCH_VALUES;
  const schema = snapshot?.schema ?? node.schema.schema;
  const controls: unknown = typeof schema === 'object' ? schema.controls : undefined;
  const watch: unknown = controls && typeof controls === 'object'
    ? Reflect.get(controls, 'watch') : undefined;
  const paths = isArray(watch) ? watch : [];
  const values = paths.length ? Object.freeze(paths.map((path: unknown) =>
    typeof path === 'string' ? readStateDependency(node.rootNode, node.path, path,
      snapshot) :
      undefined)) : EMPTY_WATCH_VALUES;
  const cache = runtime.watchValuesMemo ??
    new WeakMap<object, { commit: number; values: readonly unknown[] }>();
  cache.set(node, { commit, values });
  runtime.watchValuesMemo = cache;
  return values;
};
