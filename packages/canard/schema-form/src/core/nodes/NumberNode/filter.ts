import { isSchemaNode } from '../filter';
import type { NumberNode } from './NumberNode';

/**
 * Type guard to check if a node represents a number schema type.
 *
 * Identifies nodes that handle numeric values including integers and floats,
 * with support for range constraints and numeric validation rules.
 *
 * @param input - The value to check
 * @returns Whether the input is a NumberNode
 *
 * @example
 * Number input with validation:
 * ```tsx
 * function NumberFieldRenderer({ node }: { node: SchemaNode }) {
 *   if (!isNumberNode(node)) return null;
 *
 *   const { minimum, maximum, multipleOf } = node.jsonSchema;
 *
 *   return (
 *     <NumberInput
 *       value={node.value}
 *       min={minimum}
 *       max={maximum}
 *       step={multipleOf}
 *       onChange={(value) => {
 *         if (value !== null && !isNaN(value)) {
 *           node.setValue(value);
 *         }
 *       }}
 *       error={node.error?.[0]?.message}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * Aggregate calculations on number nodes:
 * ```typescript
 * function calculateSum(node: SchemaNode): number {
 *   let sum = 0;
 *
 *   if (isNumberNode(node) && typeof node.value === 'number') {
 *     sum += node.value;
 *   }
 *
 *   if (isBranchNode(node) && node.children) {
 *     for (const child of node.children) {
 *       sum += calculateSum(child.node);
 *     }
 *   }
 *
 *   return sum;
 * }
 * ```
 */
export const isNumberNode = (input: any): input is NumberNode =>
  isSchemaNode(input) && input.type === 'number';
