import { isArray } from '@winglet/common-utils/filter';

import type { DeriveRoundDecision } from '../../../../derive';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { markWrite } from '../../input/markWrite';
import { writeAbsentConstituent } from '../../slots/writeAbsentConstituent';
import { writeInactiveSource } from '../../slots/writeInactiveSource';

/**
 * Apply one selected automatic replacement to live or latent source.
 * A virtual group target, live or latent, distributes its tuple to the constituents' own
 * addresses: a live constituent is written, an absent one retains a defined value in its slot.
 * @param write - Winner from derive's pure decision
 * @param context - Reversible settlement work list
 * @returns Nothing; marking and latent distribution are recorded for rollback
 */
export const applyDeriveWrite = <Self extends FieldNodeRecord<Self>>(
  write: DeriveRoundDecision<Self>['writes'][number],
  context: SettlementContext<Self>,
): void => {
  const template = write.target ? write.target.blueprintNode : write.template;
  if (template?.kind !== 'virtual') {
    if (write.target) markWrite(write.target, write.value, context);
    else if (write.template && write.siblings && write.targetOrder)
      writeInactiveSource(
        context,
        write.targetPath,
        write.template,
        write.value,
        write.targetOrder,
        true,
        write.siblings,
        true,
      );
    return;
  }
  const host = write.target ? write.target.parent : write.host;
  const hostPath =
    host?.path ?? write.targetPath.slice(0, write.targetPath.lastIndexOf('/'));
  const entries = host?.blueprintNode.childEntries ?? write.siblings ?? [];
  const values = isArray(write.value) ? write.value : [];
  const fields = template.fields ?? [];
  for (let index = 0; index < fields.length; index++) {
    const sibling = host?.childrenByName?.[fields[index]];
    if (sibling) markWrite(sibling, values[index], context);
    else {
      const entry = entries.find((entry) => entry.name === fields[index]);
      if (entry)
        writeAbsentConstituent(
          context,
          host ?? undefined,
          hostPath,
          entry,
          values[index],
          true,
        );
    }
  }
};
