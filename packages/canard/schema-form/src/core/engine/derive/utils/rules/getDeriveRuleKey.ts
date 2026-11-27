import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { DeriveRule } from '../../types/rules';

/** Next ID separates a reborn record from its prior occurrence. */
let nextTargetId = 0;

/**
 * Address one authored rule at a live occurrence across settlement calls.
 * @param path - Current absolute occurrence path
 * @param kind - Fold-inclusive kind token of the live node at that path
 * @param rule - Authored declaration and expression position
 * @param target - Live value target, or the source for an injection rule; its `__deriveTargetId__` receives a fresh ID when absent
 * @returns Stable key for committed and consumed values
 */
export const getDeriveRuleKey = (
  path: string,
  kind: string,
  rule: DeriveRule,
  target: {
    readonly path: string;
    readonly blueprintNode: Parameters<typeof getBlueprintNodeIdentity>[0];
    __deriveTargetId__?: number;
  },
): string => {
  let targetId = target.__deriveTargetId__;
  if (targetId === undefined)
    target.__deriveTargetId__ = targetId = ++nextTargetId;
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
