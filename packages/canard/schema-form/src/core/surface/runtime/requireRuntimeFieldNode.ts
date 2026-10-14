import type { FieldNode as PublicFieldNode } from '../type';
import { FieldNode as RuntimeFieldNode } from './FieldNode';

/**
 * Narrow the public discriminated view to the single binding runtime class.
 * @param node - Public occurrence supplied by a schema-form binding
 * @param rootOnly - Whether this operation requires a live root shape
 * @returns Its record-bearing runtime instance
 * @throws TypeError when the input does not have the required runtime shape
 */
export const requireRuntimeFieldNode = (
  node: PublicFieldNode,
  rootOnly = false,
): RuntimeFieldNode => {
  if (
    node instanceof RuntimeFieldNode &&
    (!rootOnly || (node.isRoot && !node.detached))
  )
    return node;
  throw new TypeError(
    'Binding requires a schema-form node with the requested root shape',
  );
};
