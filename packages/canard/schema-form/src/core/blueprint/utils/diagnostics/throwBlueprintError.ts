import { JSONSchemaError } from '@/schema-form/errors';

import type { BlueprintOptions } from '../../type';
import type { BlueprintErrorCode } from './constant';

/**
 * Report and throw a path-aware schema failure without rendering its presentation.
 * @param code - Canonical blueprint error code
 * @param schemaPath - Authored location responsible for the failure
 * @param details - Code-specific diagnostic payload
 * @param options - Optional diagnostic consumer
 * @returns Never; construction cannot continue with the invalid schema
 */
export const throwBlueprintError: (
  code: BlueprintErrorCode,
  schemaPath: string,
  details?: Record<string, unknown>,
  options?: Pick<BlueprintOptions, 'collect'>,
) => never = (
  code: BlueprintErrorCode,
  schemaPath: string,
  details: Record<string, unknown> = {},
  options?: Pick<BlueprintOptions, 'collect'>,
): never => {
  options?.collect?.({ code, level: 'error', schemaPath, details });
  throw new JSONSchemaError(
    code,
    `${code} at ${schemaPath || '#'}; ${details.guidance ?? 'check the authored schema'}`,
    { schemaPath, ...details },
  );
};
