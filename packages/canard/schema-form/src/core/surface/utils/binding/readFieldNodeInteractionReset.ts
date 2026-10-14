import { readFieldNodeInteractionReset as readInteractionReset } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/**
 * Binding-only; not exported from src/index.ts.
 * Read the interaction lifetime independently of event revisions.
 * @param node - Public occurrence whose interaction lifetime is observed
 * @returns The monotone interaction-reset number
 */
export const readFieldNodeInteractionReset = (node: FieldNode): number =>
  readInteractionReset(requireRuntimeFieldNode(node));
