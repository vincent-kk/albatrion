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
 * @param node - Pending occurrence the current compute selects again
 * @param context - Settlement holding the departing record
 * @returns Nothing; the node's records leave the departing record
 */
export const applyRevivedDepartingWrites = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): void => {
  const writes = context.departingWrites;
  if (!writes?.some((write) => write.node === node)) return;
  context.departingWrites = writes.filter((write) => write.node !== node);
  const revived = writes
    .filter((write) => write.node === node)
    .sort((left, right) => left.depth - right.depth);
  const wasAutomatic = context.isAutomatic;
  context.isAutomatic = true;
  for (const { suffix, template, value } of revived) {
    const target = findLive(node, suffix);
    if (target) markWrite(target, value, context);
    else placeDeclarativeValue(context, node.path + suffix, template, value);
  }
  context.isAutomatic = wasAutomatic;
};
