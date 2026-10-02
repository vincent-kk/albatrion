import { DISPOSED_NODE_WRITE, SchemaFormError } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';

/**
 * Reject an unmarked write against a retired binding occurrence.
 * @param node - Target whose old committed reads remain available
 * @returns Nothing when the target belongs to a retained tree
 * @throws SchemaFormError with DISPOSED_NODE_WRITE for a retired tree
 */
export const assertSchemaNodeWritable = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): void => {
  if (node.disposed || node.rootNode.disposed)
    throw new SchemaFormError(DISPOSED_NODE_WRITE,
      `Cannot write disposed node at ${node.path}`, { path: node.path });
};
