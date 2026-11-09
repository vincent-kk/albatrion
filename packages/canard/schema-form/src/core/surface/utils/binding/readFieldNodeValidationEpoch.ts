import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/**
 * Read the committed validation lifetime for binding-owned asynchronous reports.
 * @param root - Public root captured when the binding starts its operation.
 * @returns A monotone mode generation; zero precedes the first transition.
 */
export const readFieldNodeValidationEpoch = (root: FieldNode): number =>
  requireRuntimeFieldNode(root, true).runtime.validationEpoch ?? 0;
