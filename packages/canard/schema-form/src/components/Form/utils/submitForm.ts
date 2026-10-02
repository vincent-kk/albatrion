import type { SchemaNode } from '@/schema-form/core';
import { SchemaFormError, ValidationError } from '@/schema-form/errors';

/** Submit the emitted snapshot, rejecting degraded settlement or failed validation. */
export const submitForm = async (
  root: SchemaNode | undefined,
  onSubmit?: (value: any) => void | Promise<void>,
  onFailure?: (error: unknown) => void,
): Promise<void> => {
  if (!root) return;
  let value: unknown;
  try {
    if (root.diagnostics.status === 'degraded')
      throw new SchemaFormError(
        'SUBMIT_WHILE_DEGRADED',
        'Cannot submit a degraded form',
        { diagnostics: root.diagnostics },
      );
    value = root.outputValue;
    const errors = await root.validate();
    if (errors.length)
      throw new ValidationError(
        'SCHEMA_VALIDATION_FAILED',
        'Schema validation failed',
        { value, errors, jsonSchema: root.jsonSchema },
      );
  } catch (error) {
    if (!(error instanceof ValidationError)) onFailure?.(error);
    throw error;
  }
  await onSubmit?.(value);
};
