import { isSchemaNode } from '../filter';
import type { VirtualNode } from './VirtualNode';

/**
 * Type guard to check if a node is a virtual node.
 *
 * Virtual nodes are special container nodes that don't correspond to actual
 * schema properties but help organize the form structure, such as conditional
 * sections or dynamic groups.
 *
 * @param input - The value to check
 * @returns Whether the input is a VirtualNode
 *
 * @example
 * Conditional section handling:
 * ```typescript
 * function renderConditionalSection(node: SchemaNode) {
 *   if (!isVirtualNode(node)) return null;
 *
 *   // Virtual nodes often represent conditional sections
 *   const isVisible = evaluateCondition(node.condition);
 *
 *   if (!isVisible) return null;
 *
 *   return (
 *     <ConditionalSection title={node.jsonSchema.title}>
 *       {node.children?.map(child => (
 *         <FormField key={child.key} node={child.node} />
 *       ))}
 *     </ConditionalSection>
 *   );
 * }
 * ```
 *
 * @example
 * Form structure optimization:
 * ```typescript
 * function flattenFormStructure(node: SchemaNode): SchemaNode[] {
 *   const flattened: SchemaNode[] = [];
 *
 *   // Skip virtual nodes in flattened structure
 *   if (!isVirtualNode(node)) {
 *     flattened.push(node);
 *   }
 *
 *   if (isBranchNode(node) && node.children) {
 *     for (const child of node.children) {
 *       flattened.push(...flattenFormStructure(child.node));
 *     }
 *   }
 *
 *   return flattened;
 * }
 * ```
 */
export const isVirtualNode = (input: any): input is VirtualNode =>
  isSchemaNode(input) && input.type === 'virtual';
