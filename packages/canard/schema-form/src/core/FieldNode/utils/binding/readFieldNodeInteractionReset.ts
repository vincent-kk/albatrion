import { readFieldNodeInteractionReset as readInteractionReset } from '../../../dispatch';
import type { FieldNode } from '../../type';
import { requireRuntimeFieldNode } from '../requireRuntimeFieldNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Read the interaction lifetime independently of event revisions.
 * @param node - Public occurrence whose interaction lifetime is observed
 * @returns The monotone interaction-reset number
 */
export const readFieldNodeInteractionReset = (node: FieldNode): number =>
  readInteractionReset(requireRuntimeFieldNode(node));
