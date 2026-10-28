import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getLoadValue } from '../loadValues/getLoadValue';
import { getSlotPathNames } from '../slots/getSlotPathNames';
import { readSlotExitPolicy } from '../slots/readSlotExitPolicy';
import { isReplacedLivePath } from '../transition/isReplacedLivePath';
import { readDepartingAncestorPolicy } from '../transition/readDepartingAncestorPolicy';
import { callInactiveValueResolver } from './callInactiveValueResolver';
import { getInactiveValueContext } from './getInactiveValueContext';
import { readInactiveValueDeclaration } from './readInactiveValueDeclaration';

/**
 * Resolve one normal retained exit before detaching its public lifetime.
 * @param node - Configured occurrence in the departing owned subtree
 * @param exit - Top exit whose nearest live ancestor supplies inherited policy
 * @param context - Last-commit inputs and call-local override results
 * @returns Nothing; undefined and failed results leave the retained source alone
 */
export const resolveInactiveValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  exit: Self,
  context: SettlementContext<Self>,
): void => {
  if (context.entered.has(node) || isReplacedLivePath(context, exit.path))
    return;
  const lineage: Self[] = [];
  for (
    let ancestor: Self | null = node;
    ancestor && ancestor !== exit.parent;
    ancestor = ancestor.parent
  )
    lineage.push(ancestor);
  let clear = readDepartingAncestorPolicy(context, exit);
  for (let index = lineage.length - 1; index >= 0; index--)
    clear = readSlotExitPolicy(lineage[index], clear);
  if (clear) return;
  const inputs = getInactiveValueContext(node, context);
  const value = getLoadValue(
    context.previousEmit,
    inputs.dataPath,
    getSlotPathNames(node.runtime, inputs.dataPath),
  );
  const listeners = node.runtime.inactiveListeners?.get(node);
  let result: unknown;
  let failed = false;
  let ordinal = 0;
  if (listeners?.size)
    for (const listener of [...listeners]) {
      if (!listeners.has(listener)) continue;
      const resolved = callInactiveValueResolver(
        node,
        listener,
        value,
        inputs,
        context,
        ordinal++,
      );
      failed ||= resolved.failed;
      if (resolved.value !== undefined) result = resolved.value;
    }
  if (failed) return;
  if (result === undefined) {
    const resolved = callInactiveValueResolver(
      node,
      readInactiveValueDeclaration(node),
      value,
      inputs,
      context,
      ordinal,
    );
    if (resolved.failed) return;
    result = resolved.value;
  }
  if (result !== undefined)
    (context.inactiveValueOverrides ??= new Map()).set(node, result);
};
