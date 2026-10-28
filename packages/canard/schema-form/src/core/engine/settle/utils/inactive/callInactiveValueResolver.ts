import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import type { InactiveValueContext } from '../../../types/controls';
import type { SettlementContext } from '../../types/settlement';
import { recordSettlementFailure } from '../errors/recordSettlementFailure';

/**
 * Invoke one consumer resolver under write refusal and isolate its failure.
 * @param node - Departing occurrence used for error attribution
 * @param resolver - Literal retained value or a synchronous authored function
 * @param value - Preceding committed value of this occurrence
 * @param inputs - Shared preceding-commit context for this node's callbacks
 * @param context - Failure collector and execution marker owner
 * @param ordinal - Stable callback position used to distinguish thrown occurrences
 * @returns Resolved value or a failed result that cancels this node's override
 */
export const callInactiveValueResolver = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  resolver: unknown,
  value: unknown,
  inputs: InactiveValueContext,
  context: SettlementContext<Self>,
  ordinal: number,
): { value: unknown; failed: boolean } => {
  if (typeof resolver !== 'function') return { value: resolver, failed: false };
  const runtime = node.runtime;
  const previous = runtime.resolvingInactiveValue;
  runtime.resolvingInactiveValue = true;
  try {
    return { value: resolver(value, inputs), failed: false };
  } catch (cause) {
    recordSettlementFailure(context, new SchemaFormError(
      FormErrorCode.ExpressionThrew,
      `Inactive value resolver failed at ${node.path}`,
      { path: node.path, schemaPath: node.blueprintNode.schemaPath, cause },
    ), 'expression', [node.path, 'inactiveValue', ordinal].join('\u0000'));
    return { value: undefined, failed: true };
  } finally {
    runtime.resolvingInactiveValue = previous;
  }
};
