import type { DeriveRule } from '../../type';

/**
 * Address one authored rule at a live occurrence across settlement calls.
 * @param path - Current absolute occurrence path
 * @param kind - Kind of the live node at that path
 * @param rule - Authored declaration and expression position
 * @returns Stable key for committed and consumed values
 */
export const getDeriveRuleKey = (
  path: string, kind: string, rule: DeriveRule,
): string => JSON.stringify([path, kind, rule.declarationId,
  rule.schemaPath, rule.targetName]);
