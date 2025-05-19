import type { Fn } from '@aileron/declare';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import type { ChildNode } from '@/schema-form/core/nodes/ObjectNode/type';
import type { SchemaNodeFactory } from '@/schema-form/core/nodes/type';
import { getDefaultValue } from '@/schema-form/helpers/defaultValue';
import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import type { FieldConditionMap } from '../getFieldConditionMap';
import { getConditionsMap } from './utils/getConditionsMap';
import { mergeShowConditions } from './utils/mergeShowConditions';

/**
 * 객체 스키마의 프로퍼티로부터 자식 노드를 생성하여 맵으로 반환합니다.
 * @param parentNode - 부모 오브젝트 노드
 * @param jsonSchema - 오브젝트 JSON 스키마
 * @param propertyKeys - 프로퍼티 키 목록
 * @param defaultValue - 기본값
 * @param fieldConditionMap - 필드 조건 맵
 * @param virtualReferenceFieldsMap - 가상 참조 필드 맵
 * @param handelChangeFactory - 변경 핸들러 팩토리 함수
 * @param nodeFactory - 노드 생성 팩토리 함수
 * @returns 자식 노드 맵
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
      isVirtualized: !!virtualReferenceFieldsMap?.get(name)?.length,
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
