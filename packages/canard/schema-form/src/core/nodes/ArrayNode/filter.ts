import { isSchemaNode } from '../filter';
import type { ArrayNode } from './ArrayNode';

/**
 * Type guard to check if a node represents an array schema type.
 *
 * Identifies nodes that handle ordered collections with support for
 * item validation, length constraints, and uniqueness requirements.
 *
 * @param input - The value to check
 * @returns Whether the input is an ArrayNode
 *
 * @example
 * Dynamic array field management:
 * ```tsx
 * function ArrayFieldRenderer({ node }: { node: SchemaNode }) {
 *   if (!isArrayNode(node)) return null;
 *
 *   const { minItems, maxItems, uniqueItems } = node.jsonSchema;
 *   const canAdd = !maxItems || (node.children?.length || 0) < maxItems;
 *   const canRemove = !minItems || (node.children?.length || 0) > minItems;
 *
 *   return (
 *     <ArrayContainer>
 *       {node.children?.map((child, index) => (
 *         <ArrayItem key={child.key}>
 *           <FormField node={child.node} />
 *           {canRemove && (
 *             <RemoveButton onClick={() => node.removeItem(index)} />
 *           )}
 *         </ArrayItem>
 *       ))}
 *       {canAdd && (
 *         <AddButton onClick={() => node.addItem()}>
 *           Add Item
 *         </AddButton>
 *       )}
 *       {uniqueItems && <Note>Duplicate items not allowed</Note>}
 *     </ArrayContainer>
 *   );
 * }
 * ```
 *
 * @example
 * Array validation and analysis:
 * ```typescript
 * function validateArrayConstraints(node: SchemaNode): ValidationResult {
 *   if (!isArrayNode(node)) {
 *     return { valid: true, errors: [] };
 *   }
 *
 *   const errors: string[] = [];
 *   const itemCount = node.children?.length || 0;
 *
 *   // Check length constraints
 *   if (node.jsonSchema.minItems && itemCount < node.jsonSchema.minItems) {
 *     errors.push(`Array must have at least ${node.jsonSchema.minItems} items`);
 *   }
 *
 *   if (node.jsonSchema.maxItems && itemCount > node.jsonSchema.maxItems) {
 *     errors.push(`Array must have at most ${node.jsonSchema.maxItems} items`);
 *   }
 *
 *   // Check uniqueness if required
 *   if (node.jsonSchema.uniqueItems && node.children) {
 *     const values = node.children.map(child => child.node.value);
 *     const uniqueValues = new Set(values.map(v => JSON.stringify(v)));
 *
 *     if (uniqueValues.size < values.length) {
 *       errors.push('Array items must be unique');
 *     }
 *   }
 *
 *   return {
 *     valid: errors.length === 0,
 *     errors
 *   };
 * }
 * ```
 */
export const isArrayNode = (input: any): input is ArrayNode =>
  isSchemaNode(input) && input.type === 'array';
