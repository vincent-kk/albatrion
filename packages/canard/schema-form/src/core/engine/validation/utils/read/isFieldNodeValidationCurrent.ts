import type { FieldNodeRecord } from '../../../record';
import { isFieldNodeValidationLifetimeCurrent } from './isFieldNodeValidationLifetimeCurrent';

/**
 * Check the complete publication lifetime, including synchronous release reentry.
 * @param node - Original request scope, still attached to its original root runtime.
 * @param load - Load generation captured before compilation or validation.
 * @param epoch - Effective mode generation captured at the same boundary.
 * @param stamp - Request generation captured when this run started.
 * @param commit - Snapshot commit captured before asynchronous execution.
 * @returns Whether the run may still publish a verdict against this tree.
 */
export const isFieldNodeValidationCurrent = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
  load: number | undefined,
  epoch: number | undefined,
  stamp: number | undefined,
  commit?: number,
): boolean => {
  const root = node.rootNode;
  const runtime = root.runtime;
  return (
    !node.disposed &&
    isFieldNodeValidationLifetimeCurrent(root, epoch) &&
    runtime.validationLoadStamp === load &&
    runtime.validationStamp === stamp &&
    (commit === undefined || (runtime.commitNumber ?? 0) === commit)
  );
};
