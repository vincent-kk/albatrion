import { isSchemaNode } from '../filter';
import type { ObjectNode } from './ObjectNode';

/**
 * Type guard to check if a node represents an object schema type.
 *
 * Identifies container nodes that hold key-value pairs, essential for
 * handling nested form structures and complex data hierarchies.
 *
 * @param input - The value to check
 * @returns Whether the input is an ObjectNode
 *
 * @example
 * Object property iteration:
 * ```typescript
 * function getObjectProperties(node: SchemaNode): Record<string, any> {
 *   if (!isObjectNode(node)) return {};
 *
 *   const properties: Record<string, any> = {};
 *
 *   if (node.children) {
 *     for (const { key, node: childNode } of node.children) {
 *       properties[key] = childNode.value;
 *     }
 *   }
 *
 *   return properties;
 * }
 * ```
 *
 * @example
 * Dynamic property management:
 * ```typescript
 * function addPropertyToObject(
 *   node: SchemaNode,
 *   propertyName: string,
 *   propertySchema: JsonSchema
 * ) {
 *   if (!isObjectNode(node)) {
 *     throw new Error('Can only add properties to object nodes');
 *   }
 *
 *   // Check if property already exists
 *   const existing = node.children?.find(child => child.name === propertyName);
 *   if (existing) {
 *     console.warn(`Property ${propertyName} already exists`);
 *     return;
 *   }
 *
 *   // Add new property (implementation depends on schema-form internals)
 *   node.addProperty(propertyName, propertySchema);
 * }
 * ```
 */
export const isObjectNode = (input: any): input is ObjectNode =>
  isSchemaNode(input) && input.type === 'object';
