import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import type { Optional } from '@aileron/declare';

import { FormErrorCode, SchemaFormError } from '../../../../../../errors';
import type {
  BlueprintChildEntry,
  EffectiveSchema,
} from '../../../../blueprint';
import { mergeEffectiveSchema } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { captureFieldNodeChange } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { captureProjectionBaseline } from '../../dependencies/captureProjectionBaseline';
import { recordSettlementFailure } from '../../errors/recordSettlementFailure';
import { isSameEffectiveSchema } from '../isSameEffectiveSchema';
import { readAdmittedEdgeSchema } from './readAdmittedEdgeSchema';

/** Ungated declarations are included by the effective-schema merger itself. */
const NO_ACTIVE_IDS: readonly number[] = EMPTY_ARRAY;

/** How one composition changed its child; shared instances, never allocated per call. */
export interface EntrySchemaChange {
  /** The child's schema record changed and was captured. */
  readonly isRecorded: boolean;
  /** The change differs from the schema the host wheel started the child from. */
  readonly isRoundChange: boolean;
}

/** The composition left the child's record as it was, or equal in content under a new reference. */
const UNCHANGED: EntrySchemaChange = {
  isRecorded: false,
  isRoundChange: false,
};
/** A reset child changed against its schema before the wheel and kept its wheel start. */
const RECORDED: EntrySchemaChange = { isRecorded: true, isRoundChange: false };
/** A reset child returned to its schema before the wheel, which differs from its wheel start. */
const RETURNED: EntrySchemaChange = { isRecorded: false, isRoundChange: true };
/** The child changed against both its schema before the wheel and its wheel start. */
const ROUND_CHANGE: EntrySchemaChange = {
  isRecorded: true,
  isRoundChange: true,
};

/**
 * Compose an admitted child's effective schema from the edge that admits it and the declarations
 * its decisions admitted: the one composition both a host's entry selection and an array item's
 * own recomposition use, so either path records the same schema and reports the same conflict.
 * @param host - Host whose edge admits the child (the array for an item)
 * @param child - Admitted live child
 * @param entry - Admitting edge
 * @param ids - Admitted declaration IDs, recorded as the child's selection
 * @param isFull - Every declaration of the edge is admitted, so the edge's own merge applies
 * @param prepared - Schema an evaluation shortcut already merged for `ids` (a discriminator bucket)
 * @param isRetained - The child existed before this selection, for its projection baseline
 * @param context - Current settlement
 * @returns Whether the record changed and whether the change counts for the host's round
 * @remarks Records the selection, the schema change (baseline, original schema, dirty and shape
 * marks, changed node) and a `SharedNodeConflict` failure whenever the composition has an empty
 * type intersection, on every path and every time the composition finds it true. A retained
 * child is recorded, and gets a schema event, only when the composition differs in content from
 * the schema it held before (before the wheel, for a child a host wheel reset with
 * `resetWheelStartSchema`); an equal composition is adopted under its own reference without a
 * record, and a reset child that returns to its earlier schema is only recomputed.
 */
export const composeEntrySchema = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  child: Self,
  entry: BlueprintChildEntry,
  ids: readonly number[],
  isFull: boolean,
  prepared: Optional<EffectiveSchema>,
  isRetained: boolean,
  context: SettlementContext<Self>,
): EntrySchemaChange => {
  if (context.selectedDeclarationIds.get(child) !== ids)
    context.selectedDeclarationIds.set(child, ids);
  const isAtomic = host.runtime.blueprint?.isAtomic;
  const schema =
    prepared ??
    (isFull
      ? readAdmittedEdgeSchema(
          entry,
          child.blueprintNode,
          isAtomic,
          host.blueprintNode,
        )?.schema
      : undefined) ??
    mergeEffectiveSchema(
      child.blueprintNode,
      context.hasGates ? ids : NO_ACTIVE_IDS,
      { mode: 'runtime', isAtomic },
    );
  // A reset child holds its wheel start: the round change compares with that start, while the
  // record compares in content with the schema it held before the wheel (`wheelPriorSchemas`).
  const prior = context.wheelPriorSchemas?.get(child);
  if (prior !== undefined) context.wheelPriorSchemas?.delete(child);
  const start = prior === undefined ? undefined : child.__schema__;
  const previous = prior ?? child.__schema__;
  let change = UNCHANGED;
  if (
    previous === schema ||
    ((isRetained || start !== undefined) &&
      isSameEffectiveSchema(previous, schema))
  ) {
    if (start !== undefined && !isSameEffectiveSchema(start, schema)) {
      context.dirtyPaths.add(child.path);
      change = RETURNED;
    }
    child.__schema__ = schema;
  } else {
    child.__schema__ = previous;
    captureProjectionBaseline(host, child, isRetained, context);
    if (!context.originalSchemas.has(child.path))
      context.originalSchemas.set(child.path, child.__schema__);
    child.__schema__ = captureFieldNodeChange(child, '__schema__', schema);
    context.dirtyPaths.add(child.path);
    if (child.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(child.path);
    context.changedNodes.add(child);
    change =
      start === undefined || !isSameEffectiveSchema(start, schema)
        ? ROUND_CHANGE
        : RECORDED;
  }
  if (schema.hasTypeConflict)
    recordSettlementFailure(
      context,
      new SchemaFormError(
        FormErrorCode.SharedNodeConflict,
        `Active declarations conflict at ${child.path}`,
        { path: child.path },
      ),
      'sharedConflict',
    );
  return change;
};
