import { SchemaFormError } from '../../../../errors';
import type { Behavior } from '../../../record';
import { ARRAY_METHOD_ON_NON_ARRAY } from '../arrayMethodErrorCode';

/**
 * Reject an array verb on a non-array row with its method and node path.
 * @param node - Non-array record supplying the diagnostic path
 * @param operation - Attempted array verb named in the diagnostic
 * @returns Never; every call throws SchemaFormError
 */
export const rejectArrayOperation: Behavior['arrange'] = (node, operation) => {
  throw new SchemaFormError(ARRAY_METHOD_ON_NON_ARRAY,
    `Cannot ${operation.kind} non-array node at ${node.path}`,
    { path: node.path, method: operation.kind });
};
