import type { FieldNodeRecord } from '../../../record';
import { settleFieldNodeValidation } from './settleFieldNodeValidation';

/** Disable validation and report one compile failure for the current load.
 * @param node - Occurrence sharing the failed load's runtime.
 * @param failure - Whole-schema compilation failure to deliver through the installed reporter.
 * @returns Nothing; pending validation settles even when a prior failure was reported. */
export const failValidationCompile = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  failure: unknown,
): void => {
  const runtime = node.rootNode.runtime;
  runtime.validationUnavailable = true;
  settleFieldNodeValidation(node);
  if (runtime.validationCompileReported) return;
  runtime.validationCompileReported = true;
  runtime.reportValidationFailure?.(failure);
};
