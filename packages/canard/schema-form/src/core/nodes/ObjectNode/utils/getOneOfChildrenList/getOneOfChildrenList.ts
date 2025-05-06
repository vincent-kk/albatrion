import { isArray, isPlainObject } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import { SchemaNodeError } from '@/schema-form/errors';
import { getFallbackValue } from '@/schema-form/helpers/fallbackValue';
import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import type { SchemaNodeFactory } from '../../../type';
import type { ObjectNode } from '../../ObjectNode';
import type { ChildNode } from '../../type';

export const getOneOfChildrenList = (
  parentNode: ObjectNode,
  jsonSchema: ObjectSchema,
  defaultValue: ObjectValue | undefined,
  childNodeMap: Map<string, ChildNode>,
  handelChangeFactory: Fn<[name: string], (input: any) => void>,
  nodeFactory: SchemaNodeFactory,
) => {
  const oneOfSchema = jsonSchema.oneOf;
  if (!oneOfSchema || !isArray(oneOfSchema)) return undefined;

  const oneOfNodeList = new Array<ChildNode[]>(oneOfSchema.length);

  for (let index = 0; index < oneOfSchema.length; index++) {
    const schema = oneOfSchema[index];

    if (jsonSchema.type === schema.type)
      throw new SchemaNodeError(
        'ONEOF_TYPE_REDEFINITION',
        `Type cannot be redefined in 'oneOf' schema. It must either be omitted or match the parent schema type.`,
        {
          jsonSchema,
          name: parentNode.name,
          type: jsonSchema.type,
          oneOfType: schema.type,
        },
      );

    const properties = schema.properties;
    if (!isPlainObject(properties)) continue;
    const keys = Object.keys(properties);
    const childNodes = new Array<ChildNode>(keys.length);
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const property = keys[keyIndex];
      if (childNodeMap.has(property))
        throw new SchemaNodeError(
          'ONEOF_PROPERTY_REDEFINITION',
          `Property '${property}' defined in 'oneOf' schema cannot redefine a property already defined in the parent schema.`,
          {
            jsonSchema,
            name: parentNode.name,
            property,
          },
        );
      const schema = properties[property];
      childNodes[keyIndex] = {
        index,
        node: nodeFactory({
          name: property,
          jsonSchema: schema,
          defaultValue: defaultValue?.[property] ?? getFallbackValue(schema),
          onChange: handelChangeFactory(property),
          nodeFactory,
          parentNode,
        }),
      };
    }
    oneOfNodeList[index] = childNodes;
  }

  return oneOfNodeList;
};
