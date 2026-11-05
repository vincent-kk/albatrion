import type { Optional } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import {
  FormErrorCode,
  SchemaFormError,
  ValidationError,
} from '@/schema-form/errors';

/**
 * Submit the emitted snapshot, rejecting degraded settlement or failed validation.
 * @param root - Current root; nothing happens without one.
 * @param onSubmit - Receives the projected value, only when validation found no issue; its
 *   failure rejects the returned promise unreported.
 * @param onFailure - Receives every rejection cause other than the validation verdict.
 * @param onInvalid - Receives the validation verdict instead of a rejection. Only `onSubmit` runs
 *   after the verdict check, so a `ValidationError` a consumer throws never reaches it.
 * @returns Resolves after `onSubmit`, or after `onInvalid` handled a verdict; rejects with the
 *   verdict when `onInvalid` is absent, and with any other failure.
 */
export const submitForm = async (
  root: Optional<FieldNode>,
  onSubmit?: (value: any) => void | Promise<void>,
  onFailure?: (error: unknown) => void,
  onInvalid?: (verdict: ValidationError) => void,
): Promise<void> => {
  if (!root) return;
  let value: unknown;
  let verdict: Optional<ValidationError>;
  try {
    if (root.diagnostics.status === 'degraded')
      throw new SchemaFormError(
        FormErrorCode.SubmitWhileDegraded,
        'Cannot submit a degraded form',
        { diagnostics: root.diagnostics },
      );
    value = root.outputValue;
    const errors = await root.validate();
    if (errors.length)
      verdict = new ValidationError(
        FormErrorCode.SchemaValidationFailed,
        'Schema validation failed',
        { value, errors, jsonSchema: root.jsonSchema },
      );
  } catch (error) {
    if (!(error instanceof ValidationError)) onFailure?.(error);
    throw error;
  }
  if (verdict) {
    if (!onInvalid) throw verdict;
    return onInvalid(verdict);
  }
  await onSubmit?.(value);
};
