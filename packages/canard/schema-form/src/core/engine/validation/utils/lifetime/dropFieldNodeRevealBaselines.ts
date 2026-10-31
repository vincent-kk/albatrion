import type { FieldNodeRecord } from '../../../record';

/** Release every affected node and policy baseline and invalidate the pending drop token.
 * @param node - Occurrence sharing the baseline runtime.
 * @returns Nothing; this is independent of whether validation is pending. */
export const dropFieldNodeRevealBaselines = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
): void => {
  const runtime = node.rootNode.runtime;
  for (const current of runtime.revealBaselineNodes ?? [])
    current.revealBaseline = undefined;
  runtime.revealBaselineNodes?.clear();
  runtime.revealPolicyBaseline = undefined;
  runtime.revealDropOwed = false;
  runtime.revealDropTask = undefined;
};
