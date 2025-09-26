import { AbstractNode } from './AbstractNode';
import type { ArrayNode } from './ArrayNode';
import type { BooleanNode } from './BooleanNode';
import type { NullNode } from './NullNode';
import type { NumberNode } from './NumberNode';
import type { ObjectNode } from './ObjectNode';
import type { StringNode } from './StringNode';
import type { VirtualNode } from './VirtualNode';
import type { SchemaNode } from './type';

/**
 * Type guard to check if a value is a SchemaNode instance.
 *
 * Essential for runtime type checking when working with dynamic node trees,
 * ensuring type safety when processing unknown values from form data or
 * external sources.
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

/**
 * Type guard to check if a node is a branch node that can contain children.
 *
 * Branch nodes are containers (objects, arrays, virtual nodes) that can have
 * child nodes, as opposed to terminal nodes that represent leaf values.
 * Essential for recursive tree traversal and structural operations.
 *
 * @param node - The SchemaNode to check
 * @returns Whether the node is a branch node (ObjectNode, ArrayNode, or VirtualNode)
 *
 * @example
 * Recursive tree traversal:
 * ```typescript
 * function walkSchemaTree(
 *   node: SchemaNode,
 *   visitor: (node: SchemaNode, depth: number) => void,
 *   depth = 0
 * ) {
 *   visitor(node, depth);
 *
 *   if (isBranchNode(node) && node.children) {
 *     for (const child of node.children) {
 *       walkSchemaTree(child.node, visitor, depth + 1);
 *     }
 *   }
 * }
 *
 * // Usage
 * walkSchemaTree(rootNode, (node, depth) => {
 *   console.log('  '.repeat(depth) + node.path);
 * });
 * ```
 *
 * @example
 * Collecting all terminal values:
 * ```typescript
 * function collectLeafValues(node: SchemaNode): Array<{ path: string, value: any }> {
 *   const values: Array<{ path: string, value: any }> = [];
 *
 *   if (isTerminalNode(node)) {
 *     values.push({ path: node.path, value: node.value });
 *   } else if (isBranchNode(node) && node.children) {
 *     for (const child of node.children) {
 *       values.push(...collectLeafValues(child.node));
 *     }
 *   }
 *
 *   return values;
 * }
 * ```
 *
 * @remarks
 * Branch nodes share common characteristics:
 * - Can have child nodes
 * - Support structural operations (add/remove children)
 * - Often rendered as containers or sections
 * - May have special validation rules for their children
 *
 * The three branch node types:
 * - **ObjectNode**: Key-value pairs (properties)
 * - **ArrayNode**: Ordered list of items
 * - **VirtualNode**: Logical grouping without schema representation
 */
export const isBranchNode = (
  node: SchemaNode,
): node is ObjectNode | ArrayNode | VirtualNode => node.group === 'branch';

/**
 * Type guard to check if a node is a terminal node (leaf node).
 *
 * Terminal nodes represent actual data values and cannot have children.
 * They are the endpoints of the schema tree where user input is captured
 * and validated.
 *
 * @param node - The SchemaNode to check
 * @returns Whether the node is a terminal node (BooleanNode, NumberNode, StringNode, or NullNode)
 *
 * @example
 * Input field generation:
 * ```typescript
 * function generateInputField(node: SchemaNode): ReactElement | null {
 *   if (!isTerminalNode(node)) {
 *     // Branch nodes need different handling
 *     return <ContainerField node={node} />;
 *   }
 *
 *   // Terminal nodes get input components
 *   const inputProps = {
 *     value: node.value,
 *     onChange: (value: any) => node.setValue(value),
 *     error: node.error?.[0]?.message,
 *     label: node.jsonSchema.title,
 *     required: node.required,
 *     disabled: node.disabled,
 *   };
 *
 *   switch (node.type) {
 *     case 'boolean':
 *       return <CheckboxField {...inputProps} />;
 *     case 'number':
 *       return <NumberField {...inputProps} />;
 *     case 'string':
 *       return <TextField {...inputProps} />;
 *     case 'null':
 *       return <NullField {...inputProps} />;
 *   }
 * }
 * ```
 *
 * @example
 * Form completion check:
 * ```typescript
 * function checkFormCompletion(node: SchemaNode): CompletionStatus {
 *   if (isTerminalNode(node)) {
 *     return {
 *       completed: node.value !== undefined && node.value !== null,
 *       required: node.required,
 *       path: node.path
 *     };
 *   }
 *
 *   // Branch nodes aggregate child completion
 *   if (isBranchNode(node) && node.children) {
 *     const childStatuses = node.children.map(child =>
 *       checkFormCompletion(child.node)
 *     );
 *
 *     const allRequired = childStatuses.filter(s => s.required);
 *     const completedRequired = allRequired.filter(s => s.completed);
 *
 *     return {
 *       completed: completedRequired.length === allRequired.length,
 *       required: allRequired.length > 0,
 *       path: node.path,
 *       children: childStatuses
 *     };
 *   }
 *
 *   return { completed: true, required: false, path: node.path };
 * }
 * ```
 *
 * @example
 * Value extraction for submission:
 * ```typescript
 * function extractFormValues(node: SchemaNode): any {
 *   if (isTerminalNode(node)) {
 *     // Terminal nodes directly return their value
 *     return node.value;
 *   }
 *
 *   if (isObjectNode(node) && node.children) {
 *     // Object nodes create key-value pairs
 *     const obj: Record<string, any> = {};
 *     for (const child of node.children) {
 *       if (child.node.value !== undefined) {
 *         obj[child.name] = extractFormValues(child.node);
 *       }
 *     }
 *     return obj;
 *   }
 *
 *   if (isArrayNode(node) && node.children) {
 *     // Array nodes create ordered lists
 *     return node.children.map(child => extractFormValues(child.node));
 *   }
 *
 *   return undefined;
 * }
 * ```
 *
 * @remarks
 * Terminal nodes are where actual data is stored in the form tree.
 * They correspond to primitive JSON Schema types and represent the
 * actual form inputs that users interact with.
 *
 * Common operations on terminal nodes:
 * - Getting/setting values
 * - Validation
 * - Rendering appropriate input components
 * - Checking completion status
 * - Extracting data for submission
 */
export const isTerminalNode = (
  node: SchemaNode,
): node is BooleanNode | NumberNode | StringNode | NullNode =>
  node.group === 'terminal';
