import type { SchemaNode } from '../../types';
import { AbstractNode } from './AbstractNode';

/**
 * Type guard to check if a value is a SchemaNode instance.
 *
 * Essential for runtime type checking when working with dynamic node trees,
 * ensuring type safety when processing unknown values from form data or
 * external sources.
 *
 * Lives beside `AbstractNode` because the check is `instanceof AbstractNode`;
 * every concrete node's own guard narrows from here.
 *
 * @param input - The value to check
 * @returns Whether the input is a SchemaNode
 *
 * @example
 * Basic node validation:
 * ```typescript
 * import { isSchemaNode } from '@canard/schema-form';
 *
 * function processNode(value: unknown) {
 *   if (!isSchemaNode(value)) {
 *     throw new Error('Expected a SchemaNode');
 *   }
 *
 *   // TypeScript knows value is SchemaNode
 *   console.log('Node type:', value.type);
 *   console.log('Node path:', value.path);
 *   console.log('Node value:', value.value);
 * }
 * ```
 *
 * @example
 * Safe node traversal:
 * ```typescript
 * function findNodeByPath(root: unknown, targetPath: string): SchemaNode | null {
 *   if (!isSchemaNode(root)) return null;
 *
 *   if (root.path === targetPath) return root;
 *
 *   // Only branch nodes have children
 *   if (isBranchNode(root) && root.children) {
 *     for (const child of root.children) {
 *       const found = findNodeByPath(child.node, targetPath);
 *       if (found) return found;
 *     }
 *   }
 *
 *   return null;
 * }
 * ```
 */
export const isSchemaNode = (input: any): input is SchemaNode =>
  input instanceof AbstractNode;
