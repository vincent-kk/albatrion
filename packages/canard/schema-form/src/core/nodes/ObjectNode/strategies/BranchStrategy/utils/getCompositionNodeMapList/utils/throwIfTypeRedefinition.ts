import { isIdenticalSchemaType } from '@winglet/json-schema/filter';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import { JSONSchemaError } from '@/schema-form/errors';
import { formatCompositionTypeRedefinitionError } from '@/schema-form/helpers/error';
import { extractSchemaInfo } from '@/schema-form/helpers/jsonSchema';
import type { ObjectSchema } from '@/schema-form/types';

/**
 * Rejects a composition branch whose `type` says something its parent does not allow.
 * A branch may omit `type`, repeat the parent's, or — under a nullable parent — narrow it to `object` or `null`.
 * @param parentNode - Object node owning the composition; its `nullable` decides whether narrowing applies
 * @param scope - Composition keyword the branch belongs to
 * @param jsonSchema - Schema of the parent object
 * @param subSchema - The branch schema
 * @throws {JSONSchemaError} `COMPOSITION_TYPE_REDEFINITION` when the branch widens the parent or names another type
 */
export const throwIfTypeRedefinition = (
  parentNode: ObjectNode,
  scope: 'oneOf' | 'anyOf',
  jsonSchema: ObjectSchema,
  subSchema: Partial<ObjectSchema>,
) => {
  if (subSchema.type === undefined) return;
  if (isIdenticalSchemaType(jsonSchema, subSchema)) return;
  const branchType = extractSchemaInfo(subSchema)?.type;
  if (parentNode.nullable && (branchType === 'object' || branchType === 'null'))
    return;
  throw new JSONSchemaError(
    'COMPOSITION_TYPE_REDEFINITION',
    formatCompositionTypeRedefinitionError(
      scope,
      jsonSchema,
      parentNode.path,
      jsonSchema.type,
      subSchema.type,
    ),
    {
      jsonSchema,
      type: jsonSchema.type,
      path: parentNode.path,
      compositionType: scope,
      subSchemaType: subSchema.type,
    },
  );
};
