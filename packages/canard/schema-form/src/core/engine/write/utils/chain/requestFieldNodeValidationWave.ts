import type { FieldNodeRecord } from '../../../record';
import {
  hasFieldNodeValidationRequest,
  requestFieldNodeValidation,
} from '../../../validation';
import { ensureValidationFailureReporter } from '../report/ensureValidationFailureReporter';
import { deliverValidationWave } from './deliverValidationWave';

/** Request an automatic verdict using the write domain's common delivery and failure surfaces.
 * @param node - Requested scope; widened to the root while its load verdict is owed.
 * @returns Nothing; the cadence owns when this request runs. */
export const requestFieldNodeValidationWave = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
): void => {
  const runtime = node.rootNode.runtime;
  ensureValidationFailureReporter(runtime);
  const scope =
    node !== node.rootNode && !hasFieldNodeValidationRequest(node)
      ? node.rootNode
      : node;
  requestFieldNodeValidation(scope, (issues, commit) =>
    deliverValidationWave(scope, issues, commit),
  );
};
