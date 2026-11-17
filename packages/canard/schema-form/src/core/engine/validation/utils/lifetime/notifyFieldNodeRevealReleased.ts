import type { FieldNodeRecord } from '../../../record';

/** Publish a release after clearing and re-arming all history lifetime state.
 * @param node - Occurrence sharing the completed release.
 * @returns Nothing; listener writes belong to a fresh release lifetime. */
export const notifyFieldNodeRevealReleased = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
): void => {
  const runtime = node.rootNode.runtime;
  runtime.revealReleaseVersion = (runtime.revealReleaseVersion ?? 0) + 1;
  for (const listener of [...(runtime.revealReleaseListeners ?? [])])
    listener();
};
