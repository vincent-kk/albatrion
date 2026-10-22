import type { BlueprintNode } from '../../../../../blueprint';
import type { FieldNodeRecord } from '../../../../../record';
import type { SettlementContext } from '../../../../types/settlement';
import { gateSelectionTable } from '../../../gates/gateSelectionTable';
import { gateWheelEvaluation } from '../../../gates/gateWheelEvaluation';
import { readGateSelectionGroup } from '../../../gates/readGateSelectionGroup';
import { verifyTableGate } from '../../../gates/verifyTableGate';
import { mergeGateSteps } from './mergeGateSteps';
import { readGateBucket } from './readGateBucket';

/** A weak bucket-identity trie keeps independent watched-key selections separate. */
interface RootDeclarationMemo {
  /** Children follow root group order and immutable bucket identity. */
  readonly buckets: WeakMap<readonly number[], RootDeclarationMemo>;
  /** Ascending selected indices accumulated through this trie position. */
  readonly selected: readonly number[];
  /** Stable declaration list at a complete combination of root buckets. */
  declarations?: BlueprintNode['declarations'][number][];
}

/** Each analyzed root owns all combinations encountered during its lifetime. */
const ROOT_DECLARATIONS = new WeakMap<BlueprintNode, RootDeclarationMemo>();

/**
 * Select E5 root declarations from independent watched-key groups without scanning inactive ones.
 * @param node - Root whose round was qualified together with child selection
 * @param context - Cached group values and positional verification frame
 * @returns Ordered active declarations, or undefined to retain the full-evaluation path
 */
export const selectRootGateDeclarations = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): BlueprintNode['declarations'][number][] | undefined => {
  const round = context.gateSelectionRounds?.get(node);
  const root = round?.active ? round.table.root : undefined;
  if (!round || !root) return undefined;
  let memo = ROOT_DECLARATIONS.get(node.blueprintNode);
  if (!memo) {
    memo = { buckets: new WeakMap(), selected: root.ungatedIndices };
    ROOT_DECLARATIONS.set(node.blueprintNode, memo);
  }
  for (const group of root.groups) {
    const bucket = readGateBucket(
      group.buckets,
      readGateSelectionGroup(node, context, group),
    );
    let next: RootDeclarationMemo | undefined = memo.buckets.get(bucket);
    if (!next) {
      next = {
        buckets: new WeakMap(),
        selected: mergeGateSteps(memo.selected, bucket),
      };
      memo.buckets.set(bucket, next);
    }
    memo = next;
  }
  const selected = memo.selected;
  if (
    gateSelectionTable.mode === 'verify' ||
    gateWheelEvaluation.mode === 'shadow'
  ) {
    const admitted = new Set(selected);
    for (
      let index = 0;
      index < node.blueprintNode.declarations.length;
      index++
    ) {
      const gate = node.blueprintNode.declarations[index].gates[0];
      if (gate) verifyTableGate(node, context, gate, admitted.has(index));
    }
  }
  return (memo.declarations ??= selected.map(
    (index) => node.blueprintNode.declarations[index],
  ));
};
