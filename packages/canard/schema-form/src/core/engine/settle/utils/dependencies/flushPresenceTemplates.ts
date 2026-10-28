import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  isDescendantPath,
  parsePointer,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import { getFeatureNodeIndex } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { expandTemplatePaths } from '../templatePaths/expandTemplatePaths';
import { evaluatedPresenceAfter } from './evaluatedPresenceAfter';
import { publishPresenceOwner } from './publishPresenceOwner';

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
        ((deepest === '' ? owner !== '' : isDescendantPath(owner, deepest)) ||
          (entry.kind === 'direct' && owner === deepest));
      if (
        !excluded &&
        host !== undefined &&
        evaluatedPresenceAfter(owner, entry.stamp, context)
      ) {
        publishPresenceOwner(owner, context);
        continue;
      }
      if (!excluded) {
        context.dirtyPaths.add(owner);
        context.dependencyOwnerPaths.add(owner);
        context.shapeDirtyPaths.add(resolvePointer(owner, '..'));
        for (let ancestor = owner; ancestor; ) {
          ancestor = resolvePointer(ancestor, '..');
          context.dirtyPaths.add(ancestor);
        }
        marked = true;
        continue;
      }
      if (entry.kind !== 'outer') continue;
      let live: Self | undefined = context.root;
      for (const segment of parsePointer(owner).segments) {
        const name = segment;
        if (typeof name !== 'string') break;
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
