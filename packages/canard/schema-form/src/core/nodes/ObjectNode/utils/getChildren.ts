import { isArray } from '@winglet/common-utils';

import type { NodeFactory } from '../../type';
import type { ObjectNode } from '../ObjectNode';
import type { ChildNode, VirtualReference } from '../type';

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
          const refNodes = reference.fields.map(
            (field) => childNodeMap.get(field)!.node,
          );
          children.push({
            node: nodeFactory({
              name: fieldName,
              jsonSchema: {
                type: 'virtual',
                ...reference,
              },
              defaultValue: refNodes.map((refNode) => refNode.defaultValue),
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
