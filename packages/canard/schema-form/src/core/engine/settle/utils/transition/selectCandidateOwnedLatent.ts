import { isArray } from '@winglet/common-utils/filter';
import { unescapeSegment } from '@winglet/json/pointer';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { reachesLatentPath } from './reachesLatentPath';

/**
 * Select unshared sources, including stale keys, inside the inherited candidate scope.
 * @param node - Departing occurrence whose parent retains the full candidate list
 * @param inherited - Optional enclosing candidate ownership restriction
 * @returns Lazy key predicate, or the inherited predicate for a single-candidate slot;
 * shared keys are excluded from cleanup and no gate is evaluated
 */
export const selectCandidateOwnedLatent = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  inherited?: (key: string) => boolean,
): ((key: string) => boolean) | undefined => {
  const host = node.parent?.blueprintNode;
  if (!host) return inherited;
  if (
    inherited === undefined &&
    node.rootNode.blueprintNode.hasCandidateDescendants &&
    node.parent
  )
    inherited = selectCandidateOwnedLatent(node.parent);
  let siblings: readonly BlueprintNode[];
  if (host.kind === 'array') {
    const candidates = host.prefixItems?.[Number(node.name)]
      ? host.prefixItemCandidates?.[Number(node.name)]
      : host.itemCandidates;
    if (!candidates || candidates.length < 2) return inherited;
    siblings = candidates;
  } else {
    if (!host.hasPropertyCandidates) return inherited;
    const candidates = host.childEntries.filter(
      (entry) => entry.name === node.name,
    );
    if (candidates.length < 2) return inherited;
    siblings = candidates.map((entry) => entry.node);
  }
  return (key) => {
    if (inherited && !inherited(key)) return false;
    const identity: unknown = JSON.parse(key);
    if (!isArray(identity) || typeof identity[0] !== 'string') return false;
    const path = identity[0];
    if (path !== node.path && !path.startsWith(node.path + '/')) return false;
    const segments =
      path === node.path
        ? []
        : path
            .slice(node.path.length + 1)
            .split('/')
            .map(unescapeSegment);
    for (const sibling of siblings)
      if (
        sibling !== node.blueprintNode &&
        reachesLatentPath(sibling, segments, 0, identity[1])
      )
        return false;
    return true;
  };
};
