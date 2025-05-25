import type { Fn } from '@aileron/declare';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import type {
  ChildNode,
  SchemaNodeFactory,
} from '@/schema-form/core/nodes/type';
import { getDefaultValue } from '@/schema-form/helpers/defaultValue';
import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import type { FieldConditionMap } from '../getFieldConditionMap';
import { getConditionsMap } from './utils/getConditionsMap';
import { mergeShowConditions } from './utils/mergeShowConditions';

/**
 * Creates child nodes from object schema properties and returns them as a map.
 * @param parentNode - Parent object node
 * @param jsonSchema - Object JSON schema
 * @param propertyKeys - List of property keys
 * @param defaultValue - Default value
 * @param fieldConditionMap - Field condition map
 * @param virtualReferenceFieldsMap - Virtual reference fields map
 * @param handelChangeFactory - Change handler factory function
 * @param nodeFactory - Node creation factory function
 * @returns Child node map
 */
export const getChildNodeMap = (
  parentNode: ObjectNode,
  jsonSchema: ObjectSchema,
  propertyKeys: string[],
  defaultValue: ObjectValue | undefined,
  fieldConditionMap: FieldConditionMap | undefined,
  virtualReferenceFieldsMap: Map<string, string[]> | undefined,
  handelChangeFactory: Fn<[name: string], (input: any) => void>,
  nodeFactory: SchemaNodeFactory,
) => {
  const conditionsMap = getConditionsMap(fieldConditionMap);
  const childNodeMap = new Map<string, ChildNode>();
  const properties = jsonSchema.properties;
  if (!properties) return childNodeMap;
  const required = jsonSchema.required;
  for (const name of propertyKeys) {
    const schema = properties[name];
    const inputDefault = defaultValue?.[name];
    const conditions = conditionsMap?.get(name);
    childNodeMap.set(name, {
      virtual: !!virtualReferenceFieldsMap?.get(name)?.length,
      node: nodeFactory({
        name,
        jsonSchema: mergeShowConditions(schema, conditions),
        defaultValue:
          inputDefault !== undefined ? inputDefault : getDefaultValue(schema),
        onChange: handelChangeFactory(name),
        nodeFactory,
        parentNode,
        required: required?.includes(name) || conditions !== undefined,
      }),
    });
  }
  return childNodeMap;
};
