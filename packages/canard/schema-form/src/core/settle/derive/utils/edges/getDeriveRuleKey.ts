import type { DeriveRule } from '../../type';

/** Live targets receive stable IDs for their record lifetime. */
const TARGET_IDS = new WeakMap<object, number>();
/** Next ID separates a reborn record from its prior occurrence. */
let nextTargetId = 0;

/**
 * Address one authored rule at a live occurrence across settlement calls.
 * @param path - Current absolute occurrence path
 * @param kind - Kind of the live node at that path
 * @param rule - Authored declaration and expression position
 * @param target - Live value target, or the source for an injection rule
 * @returns Stable key for committed and consumed values
 */
export const getDeriveRuleKey = (
  path: string, kind: string, rule: DeriveRule,
  target: { readonly path: string; readonly blueprintNode: { readonly kind: string } },
): string => {
  let targetId = TARGET_IDS.get(target);
  if (targetId === undefined) {
    targetId = ++nextTargetId;
    TARGET_IDS.set(target, targetId);
  }
  return JSON.stringify([path, kind, rule.declarationId,
    rule.schemaPath, rule.targetName, target.path, target.blueprintNode.kind,
    targetId]);
};
