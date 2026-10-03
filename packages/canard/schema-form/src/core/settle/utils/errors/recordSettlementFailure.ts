import type { SchemaFormError } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Preserve one failure occurrence and forward it once to an open dispatch chain.
 * @param context - Settlement whose ordered failures and first cause are retained
 * @param failure - Error created at its occurrence site
 * @param cause - Diagnostic category, used only for the first failure
 * @param identity - Occurrence key; target-addressed errors must include their source
 * @returns Nothing; only recomputation of the same occurrence identity is deduplicated
 */
export const recordSettlementFailure = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, failure: SchemaFormError,
  cause: NonNullable<SettlementContext<Self>['cause']>,
  identity: string = [failure.code, String(failure.details.path),
    String(failure.details.schemaPath), failure.message].join('\u0000'),
): void => {
  const keys = context.failureKeys ??= new Set();
  if (keys.has(identity)) return;
  keys.add(identity);
  const failures = context.failures ??= [];
  failures.push(failure);
  context.cause ??= cause;
  const runtime = context.root.runtime;
  if (!runtime.entryDepth) return;
  runtime.chainErrors?.push(failure);
  if (runtime.errorReporter?.hasConsumer())
    runtime.chainOccurrences?.push({ kind: 'error', error: failure });
};
