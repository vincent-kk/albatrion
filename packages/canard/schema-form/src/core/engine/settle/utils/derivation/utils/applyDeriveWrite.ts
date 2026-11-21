import { isArray } from '@winglet/common-utils/filter';

import {
  JSONPointer,
  appendSegment,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { DeriveRoundDecision } from '../../../../derive';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { markWrite } from '../../input/markWrite';
import { isLiveOccurrence } from '../../transition/isLiveOccurrence';
import { placeDeclarativeValue } from '../../transition/placeDeclarativeValue';

/** Record the coverage of a live declarative replacement before applying it. */
const markLiveDeriveWrite = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  value: unknown,
  context: SettlementContext<Self>,
): void => {
  context.liveReplacementPathsAfterRevival?.push(node.path);
  markWrite(node, value, context, undefined, undefined, 'declarative');
};

/**
 * Apply one selected automatic replacement. An address with a live node when the write is applied
 * is marked; any other address, including a target that left after an earlier winner's compute,
 * goes to `placeDeclarativeValue`. A virtual group target, live or latent, distributes its tuple to
 * the constituents' own addresses by the same rule.
 * @param write - Winner from derive's pure decision
 * @param context - Reversible settlement work list
 * @returns Nothing; marking and latent placement are recorded for rollback
 */
export const applyDeriveWrite = <Self extends FieldNodeRecord<Self>>(
  write: DeriveRoundDecision<Self>['writes'][number],
  context: SettlementContext<Self>,
): void => {
  const template = write.target ? write.target.blueprintNode : write.template;
  if (!template) return;
  if (template.kind !== 'virtual') {
    if (write.target && isLiveOccurrence(write.target, context))
      markLiveDeriveWrite(write.target, write.value, context);
    else
      placeDeclarativeValue(context, write.targetPath, template, write.value);
    return;
  }
  const host = write.target ? write.target.parent : write.host;
  const hostPath =
    host?.path ?? resolvePointer(write.targetPath, JSONPointer.Parent);
  const entries = host?.blueprintNode.childEntries ?? write.siblings ?? [];
  const values = isArray(write.value) ? write.value : [];
  const fields = template.fields ?? [];
  for (let index = 0; index < fields.length; index++) {
    const sibling = host?.childrenByName?.[fields[index]];
    if (sibling && isLiveOccurrence(sibling, context)) {
      markLiveDeriveWrite(sibling, values[index], context);
      continue;
    }
    const entry = entries.find((entry) => entry.name === fields[index]);
    if (entry)
      placeDeclarativeValue(
        context,
        appendSegment(hostPath, entry.name),
        entry.node,
        values[index],
      );
  }
};
