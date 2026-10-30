import { isArray } from '@winglet/common-utils/filter';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { FormWarningCode } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { indexFieldNodeWarning } from '../../../record';
import { assertFieldNodeWritable, disposeFieldNodeTree } from '../../../settle';
import { assertValidationRootReady } from '../../../validation';
import { rebuildRootExternalErrors } from '../entry/utils/propagateExternalErrorsToRoot';
import { dedupeWarningRecord } from '../report/dedupeWarningRecord';
import { readReferenceOnlySchemaPaths } from '../report/readReferenceOnlySchemaPaths';
import { restoreAdoptedExternalErrors } from './restoreAdoptedExternalErrors';

/**
 * Transfer an open entry to a rebuilt root before its outer call completes.
 * @param previousRoot - Root being retired by the binding
 * @param nextRoot - Replacement with the same authored form lifetime
 * @returns Nothing; the replacement runtime owns pending chain state
 * @throws SchemaFormError with FormErrorCode.DisposedNodeWrite when either root is already retired,
 *   since adopting back into a retired root would make the adoption links a cycle
 */
export const adoptFieldNodeChain = <Self extends FieldNodeRecord<Self>>(
  previousRoot: Self,
  nextRoot: Self,
): void => {
  assertFieldNodeWritable(previousRoot);
  assertFieldNodeWritable(nextRoot);
  assertValidationRootReady(nextRoot);
  rebuildRootExternalErrors(previousRoot);
  const previous = previousRoot.runtime;
  const next = nextRoot.runtime;
  next.entryDepth = previous.entryDepth;
  next.chainRoot = nextRoot;
  next.chainInitialEmit = previous.chainInitialEmit;
  next.chainErrors = previous.chainErrors;
  next.chainOccurrences = previous.chainOccurrences;
  next.enclosingChain = previous.enclosingChain;
  next.errorReporter ??= previous.errorReporter;
  next.feedbackBudget = previous.feedbackBudget;
  next.feedbackBlockedListeners = previous.feedbackBlockedListeners;
  next.feedbackLimitReported = previous.feedbackLimitReported;
  next.currentListener = previous.currentListener;
  next.onChangeBudget = previous.onChangeBudget;
  next.batchDepth = previous.batchDepth;
  next.batchWrites = previous.batchWrites;
  next.visitDepth = previous.visitDepth;
  next.visitBatchEntry = previous.visitBatchEntry;
  next.validationTargets = previous.validationTargets?.size
    ? new Set([nextRoot])
    : undefined;
  next.deliveries = previous.deliveries;
  next.queuedNonSettleEvents = previous.queuedNonSettleEvents;
  next.stateChanged = previous.stateChanged;
  next.adoptedExternalErrors = new Map(previous.adoptedExternalErrors);
  for (const [node, errors] of previous.nodeErrors ?? [])
    if (
      node !== null &&
      typeof node === 'object' &&
      'path' in node &&
      typeof node.path === 'string'
    )
      next.adoptedExternalErrors.set(node.path, errors);
  restoreAdoptedExternalErrors(nextRoot);
  if (previous.pendingWarningRecords)
    for (const [key, record] of previous.pendingWarningRecords) {
      const parts: unknown =
        record.path === undefined ? undefined : JSON.parse(key);
      indexFieldNodeWarning(
        next,
        key,
        isArray(parts) && typeof parts[1] === 'string' ? parts[1] : undefined,
        record,
      );
    }
  if (next.errorReporter?.hasConsumer()) {
    const paths =
      next.rebuiltReferenceSchemaPaths ??
      readReferenceOnlySchemaPaths(
        previous.blueprint?.schema,
        next.blueprint?.schema,
      );
    if (paths.length) {
      const code = FormWarningCode.ResetRebuiltByReference;
      const record = dedupeWarningRecord(
        (next.warningKeys ??= new Set()),
        code,
        $.Root,
        $.Root,
        () => 'Form reset rebuilt the schema by reference',
        { details: { schemaPaths: paths } },
      );
      if (record) {
        (next.pendingWarningRecords ??= new Map()).set(
          JSON.stringify([code, $.Root]),
          record,
        );
        next.chainOccurrences?.push({ kind: 'record', record });
      }
    }
  }
  next.rebuiltReferenceSchemaPaths = undefined;
  previous.adoptedRoot = nextRoot;
  previous.entryDepth = 0;
  previous.batchDepth = 0;
  previous.batchWrites = undefined;
  previous.visitDepth = 0;
  previous.visitBatchEntry = undefined;
  previous.deliveries = undefined;
  previous.queuedNonSettleEvents = undefined;
  previous.stateChanged = undefined;
  previous.chainOccurrences = undefined;
  previous.enclosingChain = undefined;
  previous.pendingWarningRecords = undefined;
  previous.warningKeysByPath = undefined;
  disposeFieldNodeTree(previousRoot);
};
