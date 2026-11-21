import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getInactiveValuePath } from '../inactive/getInactiveValuePath';
import { writeSlotPath } from '../slots/writeSlotPath';
import { readRevivedSlotWrites } from './utils/readRevivedSlotWrites';

/**
 * Write the declarative values named for departed nodes and the addresses below them into their
 * retained slots. Runs after the exit policy and the resolver results, so a named value wins over
 * both, while an address the write omitted keeps what the policy left (WRITE-079).
 * @param context - Settlement whose exits are final and whose derive did not exceed a budget
 * @returns Nothing; records apply in the order they were made, which is the rank order of their
 * winners, so a higher winner decides an address a lower one also named, whether it names an
 * ancestor or a descendant of it
 */
export const applyDepartingWrites = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  if (!context.departingWrites) return;
  for (const {
    node,
    suffix,
    template,
    value,
    revived,
  } of context.departingWrites) {
    if (!node.isDetached) continue;
    const path = getInactiveValuePath(node, context);
    if (path === undefined) continue;
    if (revived === undefined) {
      writeSlotPath(
        context.root,
        path + suffix,
        template,
        value,
        true,
        context,
      );
      continue;
    }
    for (const { suffix, template, value, isWhole } of readRevivedSlotWrites(
      revived,
    ))
      writeSlotPath(
        context.root,
        path + suffix,
        template,
        value,
        isWhole,
        context,
      );
  }
};
