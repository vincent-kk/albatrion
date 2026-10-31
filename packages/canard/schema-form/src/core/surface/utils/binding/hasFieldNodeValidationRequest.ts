import { hasFieldNodeValidationRequest as hasValidationRequest } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/**
 * Binding-only query; the package entry point does not export it.
 * @param node - Public occurrence whose mounted tree owns the validation request.
 * @returns Whether a write request or explicit root validation satisfied the mount.
 */
export const hasFieldNodeValidationRequest = (node: FieldNode): boolean =>
  hasValidationRequest(requireRuntimeFieldNode(node));
