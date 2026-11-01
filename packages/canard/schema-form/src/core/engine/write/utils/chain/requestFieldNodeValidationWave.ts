import type { FieldNodeRecord } from '../../../record';
import { requestFieldNodeValidation } from '../../../validation';
import { ensureValidationFailureReporter } from '../report/ensureValidationFailureReporter';
import { deliverValidationWave } from './deliverValidationWave';

/** Request an automatic verdict using the write domain's common delivery and failure surfaces.
 * @param node - Root or subtree scope needing the newest verdict.
 * @returns Nothing; the cadence owns when this request runs. */
export const requestFieldNodeValidationWave = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
): void => {
  const runtime = node.rootNode.runtime;
  ensureValidationFailureReporter(runtime);
  requestFieldNodeValidation(node, (issues, commit) =>
    deliverValidationWave(node, issues, commit),
  );
};
