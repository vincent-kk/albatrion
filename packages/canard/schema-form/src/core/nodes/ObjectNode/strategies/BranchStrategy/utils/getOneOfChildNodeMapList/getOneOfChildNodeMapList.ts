import { isArray, isPlainObject } from '@winglet/common-utils/filter';

import type { Fn, Nullish } from '@aileron/declare';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import type {
  ChildNode,
  HandleChange,
  SchemaNodeFactory,
} from '@/schema-form/core/nodes/type';
import { SchemaNodeError } from '@/schema-form/errors';
import { getDefaultValue } from '@/schema-form/helpers/defaultValue';
import type {
  JsonSchema,
  ObjectSchema,
  ObjectValue,
} from '@/schema-form/types';

/**
 * Creates a list of child nodes for properties defined in oneOf schema.
 * @param parentNode - Parent object node
 * @param jsonSchema - Object JSON schema
 * @param defaultValue - Default value
 * @param childNodeMap - Child node map
 * @param handelChangeFactory - Change handler factory function
 * @param nodeFactory - Node creation factory function
 * @returns Array of oneOf child node lists or undefined if no oneOf exists
 */
export const getOneOfChildNodeMapList = (
  parentNode: ObjectNode,
  jsonSchema: ObjectSchema,
  defaultValue: ObjectValue | Nullish,
  childNodeMap: Map<string, ChildNode>,
  oneOfKeySetList: Set<string>[] | undefined,
  handelChangeFactory: Fn<[name: string], HandleChange>,
  nodeFactory: SchemaNodeFactory,
) => {
  const oneOfSchemas = jsonSchema.oneOf;
  if (!oneOfSchemas || !isArray(oneOfSchemas)) return undefined;

  const oneOfLength = oneOfSchemas.length;
  const oneOfChildNodeMapList = new Array<Map<string, ChildNode>>(oneOfLength);
  for (let oneOfIndex = 0; oneOfIndex < oneOfLength; oneOfIndex++) {
    const oneOfSchema = oneOfSchemas[oneOfIndex] as Partial<ObjectSchema>;

    if (oneOfSchema.type && jsonSchema.type !== oneOfSchema.type)
      throw new SchemaNodeError(
        'ONEOF_TYPE_REDEFINITION',
        `Type cannot be redefined in 'oneOf' schema. It must either be omitted or match the parent schema type.`,
        {
          jsonSchema,
          path: parentNode.path,
          type: jsonSchema.type,
          oneOfType: oneOfSchema.type,
        },
      );

    const properties = oneOfSchema.properties;
    if (!isPlainObject(properties)) continue;

    const keys = Object.keys(properties);
    const oneOfChildNodeMap = new Map<string, ChildNode>();
    const required = oneOfSchema.required;
    for (let i = 0, l = keys.length; i < l; i++) {
      const property = keys[i];

      if (oneOfKeySetList && !oneOfKeySetList[oneOfIndex].has(property))
        continue;
      if (childNodeMap.has(property))
        throw new SchemaNodeError(
          'ONEOF_PROPERTY_REDEFINITION',
          `Property '${property}' defined in 'oneOf' schema cannot redefine a property already defined in the parent schema.`,
          {
            jsonSchema,
            path: parentNode.path,
            property,
          },
        );

      const schema = properties[property] as JsonSchema;
      const inputDefault = defaultValue?.[property];
      oneOfChildNodeMap.set(property, {
        node: nodeFactory({
          key: 'oneOf/' + oneOfIndex + '/properties/',
          name: property,
          variant: oneOfIndex,
          jsonSchema: schema,
          defaultValue:
            inputDefault !== undefined ? inputDefault : getDefaultValue(schema),
          onChange: handelChangeFactory(property),
          nodeFactory,
          parentNode,
          required: required?.includes(property),
        }),
      });
    }
    oneOfChildNodeMapList[oneOfIndex] = oneOfChildNodeMap;
  }

  return oneOfChildNodeMapList;
};
