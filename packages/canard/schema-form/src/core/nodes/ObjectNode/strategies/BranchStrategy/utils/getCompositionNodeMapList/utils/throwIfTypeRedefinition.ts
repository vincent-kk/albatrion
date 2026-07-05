import { isIdenticalSchemaType } from '@winglet/json-schema/filter';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import { JsonSchemaError } from '@/schema-form/errors';
import { formatCompositionTypeRedefinitionError } from '@/schema-form/helpers/error';
import type { ObjectSchema } from '@/schema-form/types';

export const throwIfTypeRedefinition = (
  parentNode: ObjectNode,
  scope: 'oneOf' | 'anyOf',
  jsonSchema: ObjectSchema,
  subSchema: Partial<ObjectSchema>,
) => {
  if (
    subSchema.type !== undefined &&
    isIdenticalSchemaType(jsonSchema, subSchema) === false
  )
    throw new JsonSchemaError(
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
