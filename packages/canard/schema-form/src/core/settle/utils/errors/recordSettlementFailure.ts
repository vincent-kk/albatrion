import type { SchemaFormError } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Preserve one failure occurrence and forward it once to an open dispatch chain.
 * @param context - Settlement whose ordered failures and first cause are retained
 * @param failure - Error created at its occurrence site
 * @param cause - Diagnostic category, used only for the first failure
 * @returns Nothing; recomputing the same code, path, schema and operation is deduplicated
 */
export const recordSettlementFailure = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, failure: SchemaFormError,
  cause: NonNullable<SettlementContext<Self>['cause']>,
): void => {
  const failures = context.failures ??= [];
  if (failures.some((prior) => prior.code === failure.code &&
    prior.details.path === failure.details.path &&
    prior.details.schemaPath === failure.details.schemaPath &&
    prior.message === failure.message)) return;
  failures.push(failure);
  context.cause ??= cause;
  const runtime = context.root.runtime;
  if (!runtime.entryDepth) return;
  runtime.chainErrors?.push(failure);
  if (runtime.errorReporter?.hasConsumer())
    runtime.chainOccurrences?.push({ kind: 'error', error: failure });
};
