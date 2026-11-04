import { isArray } from '@winglet/common-utils/filter';

import type { Nullable } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { hasDistributedChildInput } from '../input/hasDistributedChildInput';
import { readExplicitWriteKind } from './readExplicitWriteKind';

/**
 * Preserve a caller-authored JSON value over the exit's default resolver.
 * @param node - Configured departing occurrence
 * @param exit - Outermost subtree leaving in this call
 * @param context - Original caller input and batch origin boundaries
 * @returns Whether the closing write explicitly supplied this value
 */
export const hasExplicitInactiveValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  exit: Self,
  context: SettlementContext<Self>,
): boolean => {
  if (
    context.kind === 'automatic' ||
    !context.writtenInputs.has(context.target)
  )
    return false;
  const lineage: Self[] = [];
  let ancestor: Nullable<Self> = node;
  for (; ancestor && ancestor !== context.target; ancestor = ancestor.parent)
    lineage.push(ancestor);
  if (!ancestor) return false;
  let input = context.writtenInputs.get(context.target);
  for (let index = lineage.length; index >= 0; index--) {
    const current = index === lineage.length ? context.target : lineage[index];
    if (current.depth >= exit.depth) {
      const source = readExplicitWriteKind(context, current.path);
      if (
        source !== undefined &&
        source !== 'automatic' &&
        (current === node ||
          source !== 'callerPartial' ||
          input === null ||
          typeof input !== 'object' ||
          isArray(input))
      )
        return true;
    }
    if (index === 0) break;
    const child = lineage[index - 1];
    if (!hasDistributedChildInput(input, child.name, isArray(input)))
      return false;
    input = Reflect.get(input, child.name);
  }
  return false;
};
