import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment, unescapeSegment } from '@winglet/json/pointer';

import { getFeatureNodeIndex } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getGateRegistry } from '../gates/getGateRegistry';
import { getDependencyIndex } from './getDependencyIndex';

/** Parent pointer of a non-root occurrence, preserving escaped segments. */
const parentOf = (path: string): string => path.slice(0, path.lastIndexOf('/'));

/**
 * Register emitted child identity changes inside their existing host wheel.
 * @param host - Live branch whose latest round has finished computing children
 * @param previous - Name-to-node identities at the preceding round's end
 * @param context - Call-local dirty indexes and accumulated presence evidence
 * @returns Whether any child identity differs, even if no reader was scheduled
 */
export const registerPresenceChanges = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  previous: Readonly<Record<string, Self>>,
  context: SettlementContext<Self>,
): boolean => {
  if (!context.hasGates) return false;
  if (context.presenceMetrics) context.presenceMetrics.calls++;
  const structure = host.structure ?? {};
  const names: string[] = [];
  for (const name in previous)
    if (!hasOwnProperty(structure, name) || previous[name] !== structure[name])
      names.push(escapeSegment(name));
  for (const name in structure)
    if (!hasOwnProperty(previous, name)) names.push(escapeSegment(name));
  if (names.length === 0) return false;

  const accumulated = (context.changedPresence ??= new Set());
  const prefixes = (context.presencePrefixes ??= new Set());
  const dependencies = getDependencyIndex(context.root.runtime.blueprint);
  const owners = new Set<string>();
  const stateOnly = new Set<string>();
  for (const name of names) {
    const path = host.path + '/' + name;
    if (!accumulated.has(path)) {
      accumulated.add(path);
      for (let prefix = path; prefix; ) {
        prefix = parentOf(prefix);
        if (prefixes.has(prefix)) break;
        prefixes.add(prefix);
      }
    }
    const affected = dependencies.affectedByPresence(
      host.path,
      name,
      context.root,
    );
    for (const owner of affected.owners) owners.add(owner);
    for (const owner of affected.stateOnly) stateOnly.add(owner);
  }

  let marked = false;
  for (const owner of owners) {
    context.dirtyPaths.add(owner);
    context.dependencyOwnerPaths.add(owner);
    context.shapeDirtyPaths.add(parentOf(owner));
    for (let ancestor = owner; ancestor; ) {
      ancestor = parentOf(ancestor);
      context.dirtyPaths.add(ancestor);
    }
    marked = true;
  }
  const features = getFeatureNodeIndex(context.root.runtime.blueprint);
  for (const owner of stateOnly) {
    if (owners.has(owner)) continue;
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

  const registry = getGateRegistry(context.root.runtime);
  for (
    let ancestor = parentOf(host.path);
    host.path;
    ancestor = parentOf(ancestor)
  ) {
    if (
      !context.shapeDirtyPaths.has(ancestor) &&
      registry.mayChangeAt(ancestor, accumulated, prefixes)
    ) {
      context.shapeDirtyPaths.add(ancestor);
      marked = true;
    }
    if (
      ancestor &&
      !context.shapeDirtyPaths.has(parentOf(ancestor)) &&
      registry.mayChangeOwnDeclarationAt(ancestor, accumulated, prefixes)
    ) {
      context.shapeDirtyPaths.add(parentOf(ancestor));
      marked = true;
    }
    if (!ancestor) break;
  }
  if (marked)
    context.presenceRegistrations = (context.presenceRegistrations ?? 0) + 1;
  return true;
};
