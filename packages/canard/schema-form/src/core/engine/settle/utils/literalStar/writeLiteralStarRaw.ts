import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { setLiteralStarRaw } from '../literalStarStore/setLiteralStarRaw';

/**
 * Write a latent source through the transition rollback boundary.
 * @param context - Settlement whose automatic writes may be restored
 * @param key - Encoded absolute path and kind
 * @param present - Whether the replacement has an entry
 * @param value - Source to store when present
 * @param template - Blueprint classification of this occurrence
 * @param order - Stable root-to-leaf document order
 * @returns Nothing; the root latent map is updated
 */
export const writeLiteralStarRaw = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  key: string,
  present: boolean,
  value: unknown,
  template?: BlueprintNode,
  order?: readonly number[],
): void =>
  setLiteralStarRaw(
    context.root.runtime,
    context.inTransition ? context.literalStarAutomaticLog : undefined,
    key,
    present,
    value,
    template,
    order,
    context,
  );
