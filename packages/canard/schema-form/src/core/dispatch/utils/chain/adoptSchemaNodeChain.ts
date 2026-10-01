import type { SchemaNodeRecord } from '../../../record';
import { indexSchemaNodeWarning } from '../../../record';
import { isArray } from '@winglet/common-utils/filter';
import { RESET_REBUILT_BY_REFERENCE } from '../../../../errors';
import { assertValidationRootReady } from '../../../validation';
import { dedupeWarningRecord } from '../report/dedupeWarningRecord';
import { readReferenceOnlySchemaPaths } from '../report/readReferenceOnlySchemaPaths';

/**
 * Transfer an open entry to a rebuilt root before its outer call completes.
 * @param previousRoot - Root being retired by the binding
 * @param nextRoot - Replacement with the same authored form lifetime
 * @returns Nothing; the replacement runtime owns pending chain state
 */
export const adoptSchemaNodeChain = <Self extends SchemaNodeRecord<Self>>(
  previousRoot: Self, nextRoot: Self,
): void => {
  assertValidationRootReady(nextRoot);
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
  next.validationTargets = previous.validationTargets;
  next.deliveries = previous.deliveries;
  next.queuedNonSettleEvents = previous.queuedNonSettleEvents;
  next.stateChanged = previous.stateChanged;
  next.nodeErrors = previous.nodeErrors;
  if (previous.pendingWarningRecords)
    for (const [key, record] of previous.pendingWarningRecords) {
      const parts: unknown = record.path === undefined ? undefined : JSON.parse(key);
      indexSchemaNodeWarning(next, key,
        isArray(parts) && typeof parts[1] === 'string' ? parts[1] : undefined, record);
    }
  if (next.errorReporter?.hasConsumer()) {
    const paths = next.rebuiltReferenceSchemaPaths ??
      readReferenceOnlySchemaPaths(previous.blueprint?.schema, next.blueprint?.schema);
    if (paths.length) {
      const code = `SCHEMA_FORM_WARNING.${RESET_REBUILT_BY_REFERENCE}`;
      const record = dedupeWarningRecord(next.warningKeys ??= new Set(),
        code, '', '', () => 'Form reset rebuilt the schema by reference',
        { details: { schemaPaths: paths } });
      if (record) {
        (next.pendingWarningRecords ??= new Map()).set(
          JSON.stringify([code, '']), record);
        next.chainOccurrences?.push({ kind: 'record', record });
      }
    }
  }
  next.rebuiltReferenceSchemaPaths = undefined;
  previous.adoptedRoot = nextRoot;
  previous.entryDepth = 0;
  previous.batchDepth = 0;
  previous.batchWrites = undefined;
  previous.deliveries = undefined;
  previous.queuedNonSettleEvents = undefined;
  previous.stateChanged = undefined;
  previous.chainOccurrences = undefined;
  previous.enclosingChain = undefined;
  previous.pendingWarningRecords = undefined;
};
