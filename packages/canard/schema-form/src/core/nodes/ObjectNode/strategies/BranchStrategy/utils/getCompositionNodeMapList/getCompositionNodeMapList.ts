import { isArray, isPlainObject } from '@winglet/common-utils/filter';

import type { Fn, Nullish } from '@aileron/declare';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import type {
  ChildNode,
  HandleChange,
  SchemaNodeFactory,
} from '@/schema-form/core/nodes/type';
import { JsonSchemaError } from '@/schema-form/errors';
import { getDefaultValue } from '@/schema-form/helpers/defaultValue';
import type {
  JsonSchema,
  ObjectSchema,
  ObjectValue,
} from '@/schema-form/types';

export const getCompositionNodeMapList = (
  parentNode: ObjectNode,
  scope: 'oneOf' | 'anyOf',
  jsonSchema: ObjectSchema,
  defaultValue: ObjectValue | Nullish,
  childNodeMap: Map<string, ChildNode>,
  keySetList: Set<string>[] | undefined,
  excludeKeySet: Set<string> | undefined,
  handelChangeFactory: Fn<[name: string], HandleChange>,
  nodeFactory: SchemaNodeFactory,
) => {
  const compositionSchemas = jsonSchema[scope];
  if (!compositionSchemas || !isArray(compositionSchemas)) return undefined;

  const propertyKeySet = scope === 'anyOf' ? new Set<string>() : null;
  const compositionLength = compositionSchemas.length;
  const childNodeMapList = new Array<Map<string, ChildNode>>(compositionLength);
  for (let index = 0; index < compositionLength; index++) {
    const schema = compositionSchemas[index] as Partial<ObjectSchema>;

    if (schema.type && jsonSchema.type !== schema.type)
      throw new JsonSchemaError(
        'COMPOSITION_TYPE_REDEFINITION',
        `Type cannot be redefined in '${scope}' schema. It must either be omitted or match the parent schema type.`,
        {
          jsonSchema,
          type: jsonSchema.type,
          path: parentNode.path,
          compositionType: scope,
          subSchemaType: schema.type,
        },
      );

    const properties = schema.properties;
    if (!isPlainObject(properties)) continue;

    const keys = Object.keys(properties);
    const compositionChildNodeMap = new Map<string, ChildNode>();
    const required = schema.required;
    for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
      if (keySetList && !keySetList[index].has(k)) continue;
      if (excludeKeySet?.has(k) || propertyKeySet?.has(k))
        throw new JsonSchemaError(
          'COMPOSITION_PROPERTY_EXCLUSIVENESS_REDEFINITION',
          `Property '${k}' defined in '${scope}' schema cannot redefine a property already defined in the current schema.`,
          {
            jsonSchema,
            compositionType: scope,
            path: parentNode.path,
            property: k,
          },
        );
      if (childNodeMap.has(k))
        throw new JsonSchemaError(
          'COMPOSITION_PROPERTY_REDEFINITION',
          `Property '${k}' defined in '${scope}' schema cannot redefine a property already defined in the current schema.`,
          {
            jsonSchema,
            compositionType: scope,
            path: parentNode.path,
            property: k,
          },
        );

      const schema = properties[k] as JsonSchema;
      const inputDefault = defaultValue?.[k];
      compositionChildNodeMap.set(k, {
        node: nodeFactory({
          name: k,
          scope: scope,
          variant: index,
          jsonSchema: schema,
          defaultValue:
            inputDefault !== undefined ? inputDefault : getDefaultValue(schema),
          onChange: handelChangeFactory(k),
          nodeFactory,
          parentNode,
          required: required?.includes(k),
        }),
      });
      propertyKeySet?.add(k);
    }
    childNodeMapList[index] = compositionChildNodeMap;
  }

  return childNodeMapList;
};
