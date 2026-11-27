import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import type { BlueprintSchema } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { readValidatedControls } from '../../../utils/controls/readValidatedControls';
import { readStateDependency } from './readStateDependency';
import type { OutputValueSnapshot } from './readStateDependency';

/** Final effective schema and emitted inputs from the preceding commit. */
export interface WatchValuesSnapshot extends OutputValueSnapshot {
  /** Effective schema before the departing node's last settlement. */
  readonly schema: BlueprintSchema;
}

/**
 * Read the selected effective watch paths from current or prior emitted inputs.
 * @param node - Live or detached occurrence with an effective schema
 * @param snapshot - Pre-settlement values captured when a node leaves
 * @returns Watched values; the previous array while every value is Object.is-equal, across commits too
 */
export const readFieldNodeWatchValues = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  snapshot?: WatchValuesSnapshot,
): readonly unknown[] => {
  const runtime = node.runtime;
  const commit = runtime.commitNumber ?? 0;
  const memo = node.__watchValues__;
  if (!snapshot && memo && node.isDetached) return memo.values;
  if (node.isDetached) return EMPTY_ARRAY;
  const schema = snapshot?.schema ?? node.__schema__.schema;
  const watch = readValidatedControls(schema)?.watch;
  const paths = isArray(watch) ? watch : EMPTY_ARRAY;
  if (!snapshot && paths.length === 0 && (!memo || memo.values.length === 0))
    return EMPTY_ARRAY;
  const comparable =
    !snapshot && memo !== undefined && memo.values.length === paths.length;
  const reusable = comparable && memo.commit === commit;
  const witness = node.__watchValuesWitness__;
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
  let next: Optional<unknown[]> = comparable ? undefined : [];
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
    node.__watchValuesWitness__ = {
      schema,
      watch,
      path: node.path,
      isSnapshotRead: snapshot !== undefined,
      isContextAbsent: selectedContext == null,
    };
  if (!next) return memo!.values;
  const values = next.length ? Object.freeze(next) : EMPTY_ARRAY;
  node.__watchValues__ = { commit, values };
  return values;
};
