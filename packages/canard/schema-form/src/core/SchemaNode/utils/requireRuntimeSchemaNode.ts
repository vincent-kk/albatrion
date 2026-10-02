import type { SchemaNode as PublicSchemaNode } from '../type';
import { SchemaNode as RuntimeSchemaNode } from '../SchemaNode';

/**
 * Narrow the public discriminated view to the single binding runtime class.
 * @param node - Public occurrence supplied by a schema-form binding
 * @param rootOnly - Whether this operation requires a live root shape
 * @returns Its record-bearing runtime instance
 * @throws TypeError when the input does not have the required runtime shape
 */
export const requireRuntimeSchemaNode = (
  node: PublicSchemaNode, rootOnly = false,
): RuntimeSchemaNode => {
  if (node instanceof RuntimeSchemaNode &&
    (!rootOnly || node.isRoot && !node.detached)) return node;
  throw new TypeError('Binding requires a schema-form node with the requested root shape');
};
