import { isArray } from '@winglet/common-utils';

import type { AllowedValue } from '@/schema-form/types';

import type { SchemaNode, SchemaNodeFactory } from '../../../type';
import type { ObjectNode } from '../../ObjectNode';
import type { ChildNode, VirtualReference } from '../../type';

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
