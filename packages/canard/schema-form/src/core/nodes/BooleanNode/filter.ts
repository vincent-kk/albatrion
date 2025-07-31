import { isSchemaNode } from '../filter';
import type { BooleanNode } from './BooleanNode';

/**
 * Type guard to check if a node represents a boolean schema type.
 *
 * Used to identify nodes that handle boolean values, enabling type-safe
 * access to boolean-specific properties and methods.
 *
 * @param input - The value to check
 * @returns Whether the input is a BooleanNode
 *
 * @example
 * Conditional rendering based on node type:
 * ```tsx
 * function renderFormField(node: SchemaNode) {
 *   if (isBooleanNode(node)) {
 *     return (
 *       <Checkbox
 *         checked={node.value ?? false}
 *         onChange={(checked) => node.setValue(checked)}
 *         label={node.jsonSchema.title}
 *       />
 *     );
 *   }
 *
 *   if (isStringNode(node)) {
 *     return <TextInput node={node} />;
 *   }
 *
 *   // ... handle other types
 * }
 * ```
 *
 * @example
 * Boolean-specific validation:
 * ```typescript
 * function validateBooleanNodes(node: SchemaNode): string[] {
 *   const errors: string[] = [];
 *
 *   if (isBooleanNode(node)) {
 *     // Check boolean-specific constraints
 *     if (node.jsonSchema.const !== undefined &&
 *         node.value !== node.jsonSchema.const) {
 *       errors.push(`${node.path} must be ${node.jsonSchema.const}`);
 *     }
 *   }
 *
 *   // Recursively check children
 *   if (isBranchNode(node) && node.children) {
 *     for (const child of node.children) {
 *       errors.push(...validateBooleanNodes(child.node));
 *     }
 *   }
 *
 *   return errors;
 * }
 * ```
 */
export const isBooleanNode = (input: any): input is BooleanNode =>
  isSchemaNode(input) && input.type === 'boolean';
