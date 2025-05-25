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
 * Creates a list of child nodes from properties and virtual references defined in the object schema.
 * @param parentNode - Parent object node
 * @param propertyKeys - List of property keys
 * @param childNodeMap - Child node map
 * @param virtualReferenceFieldsMap - Virtual reference fields map
 * @param virtualReferencesMap - Virtual references map
 * @param nodeFactory - Node creation factory function
 * @returns List of child nodes
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
 * Gets nodes and default values for references.
 * @param reference - Virtual reference definition
 * @param childNodeMap - Child node map
 * @returns Reference nodes and default values
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
