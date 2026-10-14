import { JSONSchemaError } from '@/schema-form/errors';
import type { JSONSchemaErrorCode } from '@/schema-form/errors';
import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintOptions } from '../../type';

/**
 * Report and throw a path-aware schema failure without rendering its presentation.
 * @param code - Schema error code; the message names its bare part
 * @param schemaPath - Authored location responsible for the failure
 * @param details - Code-specific diagnostic payload
 * @param options - Optional diagnostic consumer
 * @returns Never; construction cannot continue with the invalid schema
 */
export const throwBlueprintError: (
  code: JSONSchemaErrorCode,
  schemaPath: string,
  details?: Record<string, unknown>,
  options?: Pick<BlueprintOptions, 'collect'>,
) => never = (
  code: JSONSchemaErrorCode,
  schemaPath: string,
  details: Record<string, unknown> = {},
  options?: Pick<BlueprintOptions, 'collect'>,
): never => {
  options?.collect?.({ code, level: 'error', schemaPath, details });
  throw new JSONSchemaError(
    code,
    `${code.slice(code.indexOf('.') + 1)} at ${schemaPath || $.Fragment}; ${details.guidance ?? 'check the authored schema'}`,
    { schemaPath, ...details },
  );
};
