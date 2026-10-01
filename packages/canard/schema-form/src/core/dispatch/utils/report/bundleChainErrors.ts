import { MULTIPLE_ERRORS, SchemaFormError } from '../../../../errors';

/**
 * Preserve one original failure or wrap several in their occurrence order.
 * @param errors - Failure values retained by the completed chain
 * @returns Original value, aggregate, or undefined for an empty list
 */
export const bundleChainErrors = (errors: readonly unknown[]): unknown =>
  errors.length < 2 ? errors[0] : new SchemaFormError(MULTIPLE_ERRORS,
    'Multiple dispatch errors', { errors });
