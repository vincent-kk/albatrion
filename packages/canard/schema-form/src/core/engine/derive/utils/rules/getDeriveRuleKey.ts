import type { TreeMemoStores } from '../../../types/treeMemoStores';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { DeriveRule } from '../../types/rules';

/** Next ID separates a reborn record from its prior occurrence. */
let nextTargetId = 0;

/**
 * Address one authored rule at a live occurrence across settlement calls.
 * @param path - Current absolute occurrence path
 * @param kind - Fold-inclusive kind token of the live node at that path
 * @param rule - Authored declaration and expression position
 * @param target - Live value target, or the source for an injection rule
 * @param runtime - Root owner of this occurrence memo or retained address state
 * @returns Stable key for committed and consumed values
 */
export const getDeriveRuleKey = (
  path: string,
  kind: string,
  rule: DeriveRule,
  target: {
    readonly path: string;
    readonly blueprintNode: Parameters<typeof getBlueprintNodeIdentity>[0];
  },
  runtime: Pick<TreeMemoStores, 'deriveTargetIds'>,
): string => {
  const TARGET_IDS = (runtime.deriveTargetIds ??= new WeakMap<
    object,
    number
  >());
  let targetId = TARGET_IDS.get(target);
  if (targetId === undefined) {
    targetId = ++nextTargetId;
    TARGET_IDS.set(target, targetId);
  }
  return JSON.stringify([
    path,
    kind,
    rule.declarationId,
    rule.schemaPath,
    rule.targetName,
    target.path,
    getBlueprintNodeIdentity(target.blueprintNode),
    targetId,
  ]);
};
