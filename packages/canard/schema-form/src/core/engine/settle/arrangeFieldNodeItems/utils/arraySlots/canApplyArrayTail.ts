import { minLite } from '@winglet/common-utils/math';

import type { Optional } from '@aileron/declare';

import { getItemEntry } from '../../../../blueprint';
import type { ArrayArrangePlan, FieldNodeRecord } from '../../../../record';

/**
 * Prove that every retained position keeps its existing raw owner and path.
 * @param host - Live branch array before its proposed structural update
 * @param plan - Slot proposal with a retained prefix and optional value tail
 * @returns Whether only the tail needs construction or retirement
 */

export const canApplyArrayTail = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  plan: Extract<ArrayArrangePlan, { kind: 'slots' }>,
): boolean => {
  const template = host.blueprintNode;
  let matchesEither: Optional<boolean> =
    (template.itemCandidates?.length ?? 0) > 1;
  if (!matchesEither) {
    matchesEither = undefined;
    {
      const items = template.prefixItemCandidates;
      if (items != null) {
        matchesEither = false;
        for (let index = 0, count = items.length; index < count; index++) {
          const candidates = items[index];

          if (candidates.length > 1) {
            matchesEither = true;
            break;
          }
        }
      }
    }
  }
  if (matchesEither) {
    return false;
  }
  if (host.raw !== undefined || host.itemCount === plan.slots.length)
    return false;
  const prefixCount = minLite(host.itemCount, plan.slots.length);
  for (let index = 0; index < prefixCount; index++) {
    const slot = plan.slots[index];
    if (!('from' in slot) || slot.from !== index) return false;
    const entry = getItemEntry(host.blueprintNode, index);
    const item = host.structure?.[String(index)];
    if (
      entry
        ? !item ||
          item.blueprintNode !== entry.node ||
          item.name !== String(index)
        : item !== undefined
    )
      return false;
  }
  for (let index = prefixCount; index < plan.slots.length; index++)
    if (!('value' in plan.slots[index])) return false;
  return true;
};
