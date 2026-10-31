import type { FieldNodeRecord } from '../../../record';

/** Remove entries through the captured generation and invalidate the drop token.
 * @param node - Occurrence sharing the release runtime.
 * @param cutoff - Inclusive generation to remove; omitted for a full release.
 * @returns Whether newer history needs another quiet slot, before notification. */
export const dropFieldNodeRevealBaselines = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
  cutoff = Infinity,
): boolean => {
  const runtime = node.rootNode.runtime;
  for (const current of runtime.revealBaselineNodes ?? []) {
    const history = current.revealBaseline;
    if (history)
      history.entries = history.entries.filter(
        (entry) => entry.generation > cutoff,
      );
    if (!history?.entries.length) {
      current.revealBaseline = undefined;
      runtime.revealBaselineNodes?.delete(current);
    }
  }
  if (runtime.revealPolicy)
    runtime.revealPolicy.entries = runtime.revealPolicy.entries.filter(
      (entry) => entry.generation > cutoff,
    );
  runtime.revealDropOwed = false;
  runtime.revealDropTask = undefined;
  return !!(
    runtime.revealBaselineNodes?.size || runtime.revealPolicy?.entries.length
  );
};
