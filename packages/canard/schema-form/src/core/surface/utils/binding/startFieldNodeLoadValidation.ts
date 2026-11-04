import { dispatchLoadValidation } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/** Binding-only load entry; not exported from the package public index.
 * @param root - Current load's public root to prepare in the post-frame slot.
 * @returns Whether the binding should run the first OnChange verdict. */
export const startFieldNodeLoadValidation = (root: FieldNode): boolean =>
  dispatchLoadValidation(requireRuntimeFieldNode(root, true));
