import type { Fn, Nullish, Optional } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import {
  FormErrorCode,
  SchemaFormError,
  ValidationError,
} from '@/schema-form/errors';

/**
 * Submit the emitted snapshot, rejecting degraded settlement or failed validation.
 * @param root - Current root; null or undefined resolves without invoking callbacks.
 * @param onSubmit - Receives the projected value, only when validation found no issue; its
 *   failure rejects the returned promise unreported.
 * @param onFailure - Receives a rejection cause raised before the verdict check (degraded settlement,
 *   validator failure); never the verdict, an `onSubmit` failure or an `onInvalid` failure.
 * @param onInvalid - Receives the validation verdict instead of a rejection. Only `onSubmit` runs
 *   after the verdict check, so a `ValidationError` a consumer throws never reaches it.
 * @returns Resolves after `onSubmit`, or after `onInvalid` handled a verdict; rejects with the
 *   verdict when `onInvalid` is absent, and with any other failure.
 */
export const submitForm = async (
  root: FieldNode | Nullish,
  onSubmit?: Fn<[value: any], void | Promise<void>>,
  onFailure?: Fn<[error: unknown]>,
  onInvalid?: Fn<[verdict: ValidationError]>,
): Promise<void> => {
  if (root == null) return;
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
