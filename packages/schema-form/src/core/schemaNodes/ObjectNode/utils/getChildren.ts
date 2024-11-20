import { schemaNodeFactory } from '../../schemaNodeFactory';
import type { ObjectNode } from '../ObjectNode';
import type { ChildNode, VirtualReference } from '../type';

export const getChildren = (
  parentNode: ObjectNode,
  childNodeMap: Map<string, ChildNode>,
  virtualReferenceFieldsMap: Map<string, string[]> | null,
  virtualReferencesMap: Map<string, VirtualReference> | null,
) => {
  const children: ChildNode[] = [];
  const hasVirtualReference = !!(
    virtualReferencesMap && virtualReferenceFieldsMap
  );

  for (const [name, childNode] of childNodeMap.entries()) {
    if (
      hasVirtualReference &&
      Array.isArray(virtualReferenceFieldsMap.get(name))
    ) {
      virtualReferenceFieldsMap.get(name)!.forEach((fieldName) => {
        if (virtualReferencesMap.has(fieldName)) {
          const reference = virtualReferencesMap.get(fieldName)!;
          const refNodes = reference.fields.map(
            (field) => childNodeMap.get(field)!.node,
          );
          children.push({
            node: schemaNodeFactory({
              name: fieldName,
              jsonSchema: {
                type: 'virtual',
                ...reference,
              },
              parentNode,
              refNodes,
              defaultValue: refNodes.map((refNode) => refNode.defaultValue),
            }),
          });
          virtualReferencesMap.delete(fieldName);
        }
      });
    }
    children.push(childNode);
  }

  return children;
};
