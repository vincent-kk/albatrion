import { hasOwnProperty } from '@winglet/common-utils/lib';
import { unescapeSegment } from '@winglet/json/pointer';

import { getFeatureNodeIndex } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { expandTemplatePaths } from '../templatePaths/expandTemplatePaths';

/**
 * Expand parked readers once at their static host, preserving both exclusions.
 * @param host - Host finishing child selection, or undefined to drain every host
 * @param context - Call-local pending readers, dirty indexes and record counters
 * @returns Whether an entry was consumed; registrations advance only for marked owners
 */
export const flushPresenceTemplates = <Self extends FieldNodeRecord<Self>>(
  host: Self | undefined,
  context: SettlementContext<Self>,
): boolean => {
  const pending = context.presenceTemplates;
  if (!pending?.size) return false;
  let found = false;
  let marked = false;
  const features = getFeatureNodeIndex(context.root.runtime.blueprint);
  for (const [key, entry] of pending) {
    if (host !== undefined && entry.host !== host.path) continue;
    found = true;
    pending.delete(key);
    for (const owner of expandTemplatePaths(context.root, entry.template)) {
      if (context.presenceMetrics) context.presenceMetrics.ownerInsertions++;
      const deepest = entry.deepest;
      const excluded =
        deepest !== null &&
        ((deepest === '' ? owner !== '' : owner.startsWith(deepest + '/')) ||
          (entry.kind === 'direct' && owner === deepest));
      if (!excluded) {
        context.dirtyPaths.add(owner);
        context.dependencyOwnerPaths.add(owner);
        context.shapeDirtyPaths.add(owner.slice(0, owner.lastIndexOf('/')));
        for (let ancestor = owner; ancestor; ) {
          ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
          context.dirtyPaths.add(ancestor);
        }
        marked = true;
        continue;
      }
      if (entry.kind !== 'outer') continue;
      let live: Self | undefined = context.root;
      for (const segment of owner ? owner.slice(1).split('/') : []) {
        const name = unescapeSegment(segment);
        live =
          live?.structure && hasOwnProperty(live.structure, name)
            ? live.structure[name]
            : undefined;
        if (!live) break;
      }
      if (!live || live.detached) continue;
      if (
        features.stateKeyNodes.has(live.blueprintNode.id) ||
        (live.parent &&
          features.stateKeyChildren
            .get(live.parent.blueprintNode.id)
            ?.has(live.name))
      ) {
        context.dependencyOwnerPaths.add(owner);
        context.stateDirtyNodes.add(live);
      }
    }
  }
  if (marked)
    context.presenceRegistrations = (context.presenceRegistrations ?? 0) + 1;
  return found;
};
