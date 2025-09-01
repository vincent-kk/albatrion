import { unique } from '@winglet/common-utils/array';

import type { Fn, Nullish } from '@aileron/declare';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import type {
  ChildNode,
  HandleChange,
  SchemaNodeFactory,
} from '@/schema-form/core/nodes/type';
import { getDefaultValue } from '@/schema-form/helpers/defaultValue';
import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import type {
  VirtualReference,
  VirtualReferenceFieldsMap,
  VirtualReferencesMap,
} from '../getVirtualReferencesMap';
import { mergeShowConditions } from '../mergeShowConditions';

/**
 * Creates child nodes from object schema properties and returns them as a map.
 * @param parentNode - Parent object node
 * @param jsonSchema - Object JSON schema
 * @param propertyKeys - List of property keys
 * @param defaultValue - Default value
 * @param conditionsMap - Conditions map for each field
 * @param virtualReferenceFieldsMap - Virtual reference fields map
 * @param handelChangeFactory - Change handler factory function
 * @param nodeFactory - Node creation factory function
 * @returns Child node map
 */
export const getChildNodeMap = (
  parentNode: ObjectNode,
  jsonSchema: ObjectSchema,
  propertyKeys: string[],
  defaultValue: ObjectValue | Nullish,
  conditionsMap: Map<string, string[]> | undefined,
  virtualReferencesMap: VirtualReferencesMap | undefined,
  virtualReferenceFieldsMap: VirtualReferenceFieldsMap | undefined,
  handelChangeFactory: Fn<[name: string], HandleChange>,
  nodeFactory: SchemaNodeFactory,
) => {
  const childNodeMap = new Map<string, ChildNode>();
  const properties = jsonSchema.properties;
  if (!properties) return childNodeMap;
  const required = jsonSchema.required;
  for (const name of propertyKeys) {
    const schema = properties[name];
    const inputDefault = defaultValue?.[name];
    const conditions = conditionsMap?.get(name);
    const virtualReferenceFields = virtualReferenceFieldsMap?.get(name);
    const virtualReferenceConditions = getVirtualReferenceConditions(
      virtualReferenceFields,
      virtualReferencesMap,
    );
    const mergedConditions =
      conditions && virtualReferenceConditions
        ? unique([...conditions, ...virtualReferenceConditions])
        : conditions || virtualReferenceConditions;

    childNodeMap.set(name, {
      virtual: !!virtualReferenceFields?.length,
      node: nodeFactory({
        name,
        jsonSchema: mergeShowConditions(schema, mergedConditions),
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

const getVirtualReferenceConditions = (
  virtualReferenceFields: VirtualReference['fields'] | undefined,
  virtualReferencesMap: VirtualReferencesMap | undefined,
) => {
  if (!virtualReferenceFields || !virtualReferencesMap) return undefined;
  const conditions: string[] = [];
  for (let i = 0, l = virtualReferenceFields.length; i < l; i++) {
    const virtualReferenceField = virtualReferenceFields[i];
    const virtualReference = virtualReferencesMap.get(virtualReferenceField);
    if (!virtualReference) continue;
    const condition =
      virtualReference.computed?.visible ?? virtualReference['&visible'];
    if (condition !== undefined) conditions.push('' + condition);
  }
  return conditions.length ? conditions : undefined;
};
