import type { SchemaNode as PublicSchemaNode } from '../type';
import { SchemaNode as RuntimeSchemaNode } from '../SchemaNode';

/**
 * Narrow the public discriminated view to the single binding runtime class.
 * @param node - Root supplied by a schema-form binding
 * @returns Its record-bearing runtime instance
 * @throws TypeError when the input is not a live runtime root
 */
export const requireRuntimeSchemaNode = (node: PublicSchemaNode): RuntimeSchemaNode => {
  if (node instanceof RuntimeSchemaNode && node.isRoot && !node.detached) return node;
  throw new TypeError('setContext requires a live schema-form root node');
};
