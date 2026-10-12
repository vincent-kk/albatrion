import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNodeRecord } from '../../../../record';
import type { DeriveRoundDecision } from '../../../derive';
import type { SettlementContext } from '../../../type';
import { distributeLatentValue } from '../../latent/distributeLatentValue';
import { markWrite } from '../../write/markWrite';

/**
 * Apply one selected automatic replacement to live or latent raw.
 * @param write - Winner from derive's pure decision
 * @param context - Reversible settlement work list
 * @returns Nothing; marking and latent distribution are recorded for rollback
 */
export const applyDeriveWrite = <Self extends SchemaNodeRecord<Self>>(
  write: DeriveRoundDecision<Self>['writes'][number],
  context: SettlementContext<Self>,
): void => {
  if (!write.target) {
    if (write.template && write.siblings && write.targetOrder)
      distributeLatentValue(context.root.runtime, context, write.targetPath,
        write.template, write.value, write.targetOrder, true, write.siblings, true);
    return;
  }
  if (write.target.blueprintNode.kind !== 'virtual') {
    markWrite(write.target, write.value, context);
    return;
  }
  const values = isArray(write.value) ? write.value : [];
  const fields = write.target.blueprintNode.fields ?? [];
  for (let index = 0; index < fields.length; index++) {
    const sibling = write.target.parent?.structure?.[fields[index]];
    if (sibling) markWrite(sibling, values[index], context);
  }
};
