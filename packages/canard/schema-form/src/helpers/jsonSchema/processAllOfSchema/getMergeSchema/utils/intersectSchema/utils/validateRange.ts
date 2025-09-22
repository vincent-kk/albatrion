import { JsonSchemaError } from '@/schema-form/errors';

/**
 * 범위 검증을 수행합니다 (min <= max).
 */
export function validateRange(
  min?: number,
  max?: number,
  errorMessage: string = 'Invalid range: min > max',
): void {
  if (min !== undefined && max !== undefined && min > max) {
    throw new JsonSchemaError(
      'INVALID_RANGE',
      `${errorMessage} (${min} > ${max})`,
    );
  }
}
