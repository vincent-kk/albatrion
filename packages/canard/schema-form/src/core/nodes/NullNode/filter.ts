import { isSchemaNode } from '../filter';
import type { NullNode } from './NullNode';

/**
 * Type guard to check if a node represents a null schema type.
 *
 * Identifies nodes that explicitly handle null values, often used in
 * schemas that allow nullable fields or union types with null.
 *
 * @param input - The value to check
 * @returns Whether the input is a NullNode
 *
 * @example
 * Nullable field handling:
 * ```typescript
 * function renderNullableField(node: SchemaNode) {
 *   // Handle explicit null type
 *   if (isNullNode(node)) {
 *     return <NullIndicator label={node.jsonSchema.title || 'No value'} />;
 *   }
 *
 *   // Handle other types that might be nullable
 *   if (isStringNode(node)) {
 *     return (
 *       <NullableInput
 *         value={node.value}
 *         onChange={(value) => node.setValue(value)}
 *         allowNull={node.jsonSchema.nullable}
 *       />
 *     );
 *   }
 *
 *   return null;
 * }
 * ```
 *
 * @example
 * Null value statistics:
 * ```typescript
 * function countNullValues(root: SchemaNode): NullStats {
 *   const stats = {
 *     totalNullNodes: 0,
 *     nullableFields: 0,
 *     actualNullValues: 0
 *   };
 *
 *   function traverse(node: SchemaNode) {
 *     if (isNullNode(node)) {
 *       stats.totalNullNodes++;
 *     }
 *
 *     if (node.jsonSchema.nullable) {
 *       stats.nullableFields++;
 *     }
 *
 *     if (node.value === null) {
 *       stats.actualNullValues++;
 *     }
 *
 *     if (isBranchNode(node) && node.children) {
 *       node.children.forEach(child => traverse(child.node));
 *     }
 *   }
 *
 *   traverse(root);
 *   return stats;
 * }
 * ```
 */
export const isNullNode = (input: any): input is NullNode =>
  isSchemaNode(input) && input.type === 'null';
