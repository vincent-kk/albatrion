import type { Fn } from '@aileron/declare';

import { getFallbackValue } from '@/schema-form/helpers/fallbackValue';
import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import type { SchemaNodeFactory } from '../../../type';
import type { ObjectNode } from '../../ObjectNode';
import type { ChildNode } from '../../type';
import type { FieldConditionMap } from '../getFieldConditionMap';
import { getConditionsMap } from './utils/getConditionsMap';
import { mergeShowConditions } from './utils/mergeShowConditions';

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
  for (const name of propertyKeys) {
    const schema = properties[name];
    childNodeMap.set(name, {
      isVirtualized: !!virtualReferenceFieldsMap?.get(name)?.length,
      node: nodeFactory({
        name,
        jsonSchema: mergeShowConditions(schema, conditionsMap?.get(name)),
        defaultValue: defaultValue?.[name] ?? getFallbackValue(schema),
        onChange: handelChangeFactory(name),
        nodeFactory,
        parentNode,
      }),
    });
  }
  return childNodeMap;
};
