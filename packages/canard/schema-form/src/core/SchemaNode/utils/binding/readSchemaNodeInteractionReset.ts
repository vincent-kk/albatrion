import { readSchemaNodeInteractionReset as readInteractionReset } from '../../../dispatch';
import type { SchemaNode } from '../../type';
import { requireRuntimeSchemaNode } from '../requireRuntimeSchemaNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Read the interaction lifetime independently of event revisions.
 * @param node - Public occurrence whose interaction lifetime is observed
 * @returns The monotone interaction-reset number
 */
export const readSchemaNodeInteractionReset = (
  node: SchemaNode,
): number =>
  readInteractionReset(requireRuntimeSchemaNode(node));

