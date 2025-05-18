import { isArray, isPlainObject } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import type { ChildNode } from '@/schema-form/core/nodes/ObjectNode/type';
import type { SchemaNodeFactory } from '@/schema-form/core/nodes/type';
import { SchemaNodeError } from '@/schema-form/errors';
import { getDefaultValue } from '@/schema-form/helpers/defaultValue';
import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

/**
 * oneOf 스키마에 정의된 프로퍼티에 대한 자식 노드 목록을 생성합니다.
 * @param parentNode - 부모 객체 노드
 * @param jsonSchema - 오브젝트 JSON 스키마
 * @param defaultValue - 기본값
 * @param childNodeMap - 자식 노드 맵
 * @param handelChangeFactory - 변경 핸들러 팩토리 함수
 * @param nodeFactory - 노드 생성 팩토리 함수
 * @returns oneOf 자식 노드 목록들의 배열 또는 oneOf가 없는 경우 undefined
 */
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

    if (schema.type && jsonSchema.type !== schema.type)
      throw new SchemaNodeError(
        'ONEOF_TYPE_REDEFINITION',
        `Type cannot be redefined in 'oneOf' schema. It must either be omitted or match the parent schema type.`,
        {
          jsonSchema,
          path: parentNode.path,
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
            path: parentNode.path,
            property,
          },
        );
      const schema = properties[property];
      const inputDefault = defaultValue?.[property];
      childNodes[keyIndex] = {
        index,
        node: nodeFactory({
          name: property,
          jsonSchema: schema,
          defaultValue:
            inputDefault !== undefined ? inputDefault : getDefaultValue(schema),
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
