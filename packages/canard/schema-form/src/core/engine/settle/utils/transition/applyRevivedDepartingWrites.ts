import type { Optional } from '@aileron/declare';

import { parsePointerSegments } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { markWrite } from '../input/markWrite';
import { placeDeclarativeValue } from './placeDeclarativeValue';

/** Live node at `suffix` below `node`, or undefined when a step on the way is not live. */
const findLive = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  suffix: string,
): Optional<Self> => {
  let current: Optional<Self> = node;
  for (const name of parsePointerSegments(suffix))
    current =
      typeof name === 'string' ? current?.childrenByName?.[name] : undefined;
  return current;
};

/**
 * Apply the declarative values recorded for a node whose exit this settlement cancels. The node
 * stays live, so no exit policy runs, and each value is the same write made to it after the
 * revival: a live address is marked, an inactive one below it is placed like any latent write.
 * Records apply in the order they were made, the rank order of their winners (WRITE-079).
 * @param node - Pending occurrence the current compute selects again
 * @param context - Settlement holding the departing record
 * @returns Nothing; applied records remain available for another exit of the same occurrence
 */
export const applyRevivedDepartingWrites = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): void => {
  const writes = context.departingWrites;
  if (!writes || context.exceededBudget) return;
  const pending = writes.filter(
    (write) => write.node === node && write.revivedAt === undefined,
  );
  if (!pending.length) return;
  const wasAutomatic = context.isAutomatic;
  context.isAutomatic = true;
  for (const write of pending) {
    const target = findLive(node, write.suffix);
    if (target) {
      const replacements = (context.liveReplacementPathsAfterRevival ??= []);
      write.revivedAt = replacements.push(target.path);
      markWrite(target, write.value, context, undefined, undefined, 'revived');
    } else {
      writes.splice(writes.indexOf(write), 1);
      placeDeclarativeValue(
        context,
        node.path + write.suffix,
        write.template,
        write.value,
      );
    }
  }
  context.isAutomatic = wasAutomatic;
};
