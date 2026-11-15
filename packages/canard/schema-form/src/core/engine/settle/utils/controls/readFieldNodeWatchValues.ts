import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import type { BlueprintSchema } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { readValidatedControls } from '../../../utils/controls/readValidatedControls';
import { readStateDependency } from './readStateDependency';
import type { OutputValueSnapshot } from './readStateDependency';

/** Final effective schema and emitted inputs from the preceding commit. */
export interface WatchValuesSnapshot extends OutputValueSnapshot {
  /** Effective schema before the departing node's last settlement. */
  readonly schema: BlueprintSchema;
}

/** Identity guards for reusing an absent-context value within one node/commit. */
interface WatchValuesWitness {
  schema: BlueprintSchema;
  watch: unknown;
  path: string;
  isSnapshotRead: boolean;
  isContextAbsent: boolean;
}

/**
 * Read the selected effective watch paths from current or prior emitted inputs.
 * @param node - Live or detached occurrence with an effective schema
 * @param snapshot - Pre-settlement values captured when a node leaves
 * @returns Stable watched values for this commit or the detached snapshot
 */
export const readFieldNodeWatchValues = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  snapshot?: WatchValuesSnapshot,
): readonly unknown[] => {
  const runtime = node.runtime;
  const commit = runtime.commitNumber ?? 0;
  const memo = runtime.watchValuesMemo?.get(node);
  if (!snapshot && memo && node.isDetached) return memo.values;
  if (node.isDetached) return EMPTY_ARRAY;
  const schema = snapshot?.schema ?? node.schema.schema;
  const watch = readValidatedControls(schema)?.watch;
  const paths = isArray(watch) ? watch : EMPTY_ARRAY;
  if (!snapshot && paths.length === 0 && (!memo || memo.values.length === 0))
    return EMPTY_ARRAY;
  const reusable =
    !snapshot && memo?.commit === commit && memo.values.length === paths.length;
  const derived = getHostDerived<'watchValuesWitness', WatchValuesWitness>(
    node,
  );
  const witness = derived.watchValuesWitness;
  const selectedContext = snapshot ? snapshot.context : runtime.context;
  const reuseAbsentContext =
    reusable &&
    witness !== undefined &&
    witness.schema === schema &&
    witness.watch === watch &&
    witness.path === node.path &&
    !witness.isSnapshotRead &&
    witness.isContextAbsent &&
    selectedContext == null;
  let next: Optional<unknown[]> = reusable ? undefined : [];
  for (let index = 0; index < paths.length; index++) {
    const path = paths[index];
    const previous = reuseAbsentContext ? memo!.values[index] : undefined;
    const absentContext =
      previous !== null && typeof previous === 'object' ? previous : undefined;
    const value = readStateDependency(
      node.rootNode,
      node.path,
      path,
      snapshot,
      node,
      absentContext,
    );
    if (!next && !Object.is(value, memo!.values[index]))
      next = memo!.values.slice(0, index);
    next?.push(value);
  }
  if (witness) {
    witness.schema = schema;
    witness.watch = watch;
    witness.path = node.path;
    witness.isSnapshotRead = snapshot !== undefined;
    witness.isContextAbsent = selectedContext == null;
  } else
    derived.watchValuesWitness = {
      schema,
      watch,
      path: node.path,
      isSnapshotRead: snapshot !== undefined,
      isContextAbsent: selectedContext == null,
    };
  if (!next) return memo!.values;
  const values = next.length ? Object.freeze(next) : EMPTY_ARRAY;
  const cache = runtime.watchValuesMemo ?? new WeakMap();
  cache.set(node, { commit, values });
  runtime.watchValuesMemo = cache;
  return values;
};
