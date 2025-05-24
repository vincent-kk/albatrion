import { isArray } from '@winglet/common-utils';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import type { VirtualReference } from '@/schema-form/core/nodes/ObjectNode/type';
import type {
  ChildNode,
  SchemaNode,
  SchemaNodeFactory,
} from '@/schema-form/core/nodes/type';
import type { AllowedValue } from '@/schema-form/types';

/**
 * 객체 스키마에 정의된 프로퍼티와 가상 참조로부터 자식 노드 목록을 생성합니다.
 * @param parentNode - 부모 객체 노드
 * @param propertyKeys - 프로퍼티 키 목록
 * @param childNodeMap - 자식 노드 맵
 * @param virtualReferenceFieldsMap - 가상 참조 필드 맵
 * @param virtualReferencesMap - 가상 참조 맵
 * @param nodeFactory - 노드 생성 팩토리 함수
 * @returns 자식 노드 목록
 */
export const getChildren = (
  parentNode: ObjectNode,
  propertyKeys: string[],
  childNodeMap: Map<string, ChildNode>,
  virtualReferenceFieldsMap: Map<string, string[]> | undefined,
  virtualReferencesMap: Map<string, VirtualReference> | undefined,
  nodeFactory: SchemaNodeFactory,
) => {
  const children: ChildNode[] = [];
  const hasVirtualReference = !!(
    virtualReferencesMap && virtualReferenceFieldsMap
  );
  for (const name of propertyKeys) {
    const childNode = childNodeMap.get(name)!;
    const virtualReferenceFields = virtualReferenceFieldsMap?.get(name);
    if (hasVirtualReference && isArray(virtualReferenceFields)) {
      for (const fieldName of virtualReferenceFields) {
        if (virtualReferencesMap.has(fieldName)) {
          const reference = virtualReferencesMap.get(fieldName)!;
          const { refNodes, defaultValue } = getRefNodes(
            reference,
            childNodeMap,
          );
          children.push({
            node: nodeFactory({
              name: fieldName,
              jsonSchema: {
                type: 'virtual',
                ...reference,
              },
              defaultValue,
              parentNode,
              nodeFactory,
              refNodes,
            }),
          });
          virtualReferencesMap.delete(fieldName);
        }
      }
    }
    children.push(childNode);
  }
  return children;
};

/**
 * 참조를 위한 노드와 기본값을 가져옵니다.
 * @param reference - 가상 참조 정의
 * @param childNodeMap - 자식 노드 맵
 * @returns 참조 노드와 기본값
 */
const getRefNodes = (
  reference: VirtualReference,
  childNodeMap: Map<string, ChildNode>,
) => {
  const refNodes: SchemaNode[] = [];
  const defaultValue: AllowedValue[] = [];
  for (const field of reference.fields) {
    const refNode = childNodeMap.get(field);
    if (!refNode) continue;
    refNodes.push(refNode.node);
    defaultValue.push(refNode.node.defaultValue);
  }
  return { refNodes, defaultValue };
};
