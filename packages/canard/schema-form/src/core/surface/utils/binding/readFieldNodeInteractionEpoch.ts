import { readFieldNodeInteractionEpoch as readInteractionEpoch } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/**
 * Binding-only; not exported from src/index.ts.
 * Read the interaction lifetime independently of event revisions.
 * @param node - Public occurrence whose interaction lifetime is observed
 * @returns The monotone interaction epoch
 */
export const readFieldNodeInteractionEpoch = (node: FieldNode): number =>
  readInteractionEpoch(requireRuntimeFieldNode(node));
