import { isArray } from '@winglet/common-utils';

import type { AllowedValue } from '@/schema-form/types';

import type { NodeFactory, SchemaNode } from '../../../type';
import type { ObjectNode } from '../../ObjectNode';
import type { ChildNode, VirtualReference } from '../../type';

export const getChildren = (
  parentNode: ObjectNode,
  childNodeMap: Map<string, ChildNode>,
  virtualReferenceFieldsMap: Map<string, string[]> | null,
  virtualReferencesMap: Map<string, VirtualReference> | null,
  nodeFactory: NodeFactory,
) => {
  const children: ChildNode[] = [];
  const hasVirtualReference = !!(
    virtualReferencesMap && virtualReferenceFieldsMap
  );
  for (const [name, childNode] of childNodeMap.entries()) {
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
