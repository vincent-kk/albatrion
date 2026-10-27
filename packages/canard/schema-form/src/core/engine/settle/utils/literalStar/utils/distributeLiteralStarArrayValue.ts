import { getItemEntries } from '../../../../blueprint';
import type { BlueprintChildEntry, BlueprintNode } from '../../../../blueprint';
import type { FieldNodeRecord, FieldNodeRuntime } from '../../../../record';
import { getBlueprintNodeIdentity } from '../../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../../types/settlement';
import { LiteralStarHostSource } from '../../literalStarStore/LiteralStarHostSource';
import { pruneLiteralStarRaw } from '../../literalStarStore/pruneLiteralStarRaw';
import { setLiteralStarRaw } from '../../literalStarStore/setLiteralStarRaw';

/**
 * Bind candidate-bearing array input now and retain only its length and tail payload.
 * @param runtime - Tree-local latent storage
 * @param context - Optional rollback and latent-index bookkeeping
 * @param path - Absent array occurrence's absolute address
 * @param template - Array declaration containing candidate descendants
 * @param value - Replacement array supplied at this address
 * @param order - Array occurrence's blueprint order
 * @param distribute - Recursive ordinary write distribution for each declared slot
 * @returns Whether a supplied declared descendant has a projected value
 */
export const distributeLiteralStarArrayValue = <
  Self extends FieldNodeRecord<Self>,
>(
  runtime: FieldNodeRuntime<Self>,
  context: SettlementContext<Self> | undefined,
  path: string,
  template: BlueprintNode,
  value: readonly unknown[],
  order: readonly number[],
  distribute: (
    path: string,
    template: BlueprintNode,
    value: unknown,
    order: readonly number[],
    siblings: readonly BlueprintChildEntry[],
  ) => boolean,
): boolean => {
  pruneLiteralStarRaw(runtime, path, undefined, context);
  const raw = value.slice();
  let retainedItemNames: string[] | undefined;
  let wrote = false;
  for (let index = 0; index < value.length; index++) {
    const entries = getItemEntries(template, index);
    const entry = entries[0];
    if (!entry) continue;
    const name = String(index);
    if (
      distribute(
        path + '/' + name,
        entry.node,
        value[index],
        [...order, index],
        entries,
      )
    )
      wrote = true;
    (retainedItemNames ??= []).push(name);
    raw[index] = undefined;
  }
  setLiteralStarRaw(
    runtime,
    context?.inTransition ? context.literalStarAutomaticLog : undefined,
    JSON.stringify([path, getBlueprintNodeIdentity(template)]),
    true,
    new LiteralStarHostSource(Object.freeze(raw), undefined, retainedItemNames),
    template,
    order,
    context,
  );
  return wrote;
};
