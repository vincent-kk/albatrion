import { getRandomString, isArray, isPlainObject } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import type {
  ChildNode,
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
export const getOneOfChildrenList = (
  parentNode: ObjectNode,
  jsonSchema: ObjectSchema,
  defaultValue: ObjectValue | undefined,
  childNodeMap: Map<string, ChildNode>,
  handelChangeFactory: Fn<[name: string], (input: any) => void>,
  nodeFactory: SchemaNodeFactory,
) => {
  const oneOfSchemas = jsonSchema.oneOf;
  if (!oneOfSchemas || !isArray(oneOfSchemas)) return undefined;

  const oneOfNodeList = new Array<ChildNode[]>(oneOfSchemas.length);

  for (let index = 0; index < oneOfSchemas.length; index++) {
    const oneOfSchema = oneOfSchemas[index] as Partial<ObjectSchema>;
    const salt = getRandomString();

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
    const childNodes = new Array<ChildNode>(keys.length);
    const required = oneOfSchema.required;
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const property = keys[keyIndex];
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
      childNodes[keyIndex] = {
        salt,
        node: nodeFactory({
          key: property + '/oneOf/' + index,
          name: property,
          jsonSchema: schema,
          defaultValue:
            inputDefault !== undefined ? inputDefault : getDefaultValue(schema),
          onChange: handelChangeFactory(property),
          nodeFactory,
          parentNode,
          required: required?.includes(property),
        }),
      };
    }
    oneOfNodeList[index] = childNodes;
  }

  return oneOfNodeList;
};
