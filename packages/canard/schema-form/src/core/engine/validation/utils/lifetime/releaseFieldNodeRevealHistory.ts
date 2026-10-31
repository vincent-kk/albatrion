import type { FieldNodeRecord } from '../../../record';
import { dropFieldNodeRevealBaselines } from './dropFieldNodeRevealBaselines';
import { notifyFieldNodeRevealReleased } from './notifyFieldNodeRevealReleased';

/** Release all eligibility history before notifying candidates.
 * @param node - Occurrence sharing the accepted verdict or disposal.
 * @returns Nothing; the committed policy survives until the root is retired. */
export const releaseFieldNodeRevealHistory = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
): void => {
  dropFieldNodeRevealBaselines(node);
  notifyFieldNodeRevealReleased(node);
};
