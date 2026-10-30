import { hasOwnProperty } from '@winglet/common-utils/lib';
import { maxLite } from '@winglet/common-utils/math';

import type { Dictionary } from '@aileron/declare';

import {
  JSONPointer as $,
  appendSegment,
  parsePointerSegment,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import { getFeatureNodeIndex } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getGateRegistry } from '../gates/getGateRegistry';
import { collectPresenceChangeNames } from './collectPresenceChangeNames';
import { deferPresenceTemplate } from './deferPresenceTemplate';
import { evaluatedPresenceAfter } from './evaluatedPresenceAfter';
import { getDependencyIndex } from './getDependencyIndex';
import { getLivePresenceNode } from './getLivePresenceNode';
import { publishPresenceOwner } from './publishPresenceOwner';
import { registerProjectionChanges } from './registerProjectionChanges';

/** Parent pointer of a non-root occurrence, preserving escaped segments. */
const parentOf = (path: string): string => resolvePointer(path, $.Parent);

/**
 * Register child identity or projected emission changes in their existing host wheel.
 * @param host - Live branch whose latest round has finished computing children
 * @param previous - Name-to-node identities at the preceding round's end
 * @param context - Call-local dirty indexes and accumulated presence evidence
 * @returns Whether any child identity or projected emission differs, even if no reader was scheduled
 */
export const registerPresenceChanges = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  previous: Readonly<Dictionary<Self>>,
  context: SettlementContext<Self>,
): boolean => {
  if (!context.hasGates) return false;
  if (context.presenceMetrics) context.presenceMetrics.calls++;
  const structure = host.structure ?? {};
  const names = collectPresenceChangeNames(host, previous, context);
  registerProjectionChanges(host, names, context);
  if (names.length === 0) return false;

  const accumulated = (context.changedPresence ??= new Set());
  const prefixes = (context.presencePrefixes ??= new Set());
  const changedLog = (context.presenceLog ??= []);
  const prefixLog = (context.presencePrefixLog ??= []);
  const dependencies = getDependencyIndex(context.root.runtime.blueprint);
  const owners = new Set<string>();
  const ownerStamps = new Map<string, number>();
  const stateOnly = new Set<string>();
  let marked = false;
  for (const name of names) {
    const rawName = parsePointerSegment(name);
    if (typeof rawName !== 'string') continue;
    const path = appendSegment(host.path, rawName);
    const child = hasOwnProperty(structure, rawName)
      ? structure[rawName]
      : undefined;
    const computeStart = child
      ? (context.presenceComputeStarts?.get(child) ?? 0)
      : 0;
    let stamp = computeStart;
    if (computeStart <= (context.presenceRoundStarts?.get(host) ?? 0)) {
      context.presenceClock = (context.presenceClock ?? 0) + 1;
      stamp = context.presenceClock;
    }
    if (!accumulated.has(path)) {
      accumulated.add(path);
      changedLog.push(path);
      for (let prefix = path; prefix; ) {
        prefix = parentOf(prefix);
        if (prefixes.has(prefix)) break;
        prefixes.add(prefix);
        prefixLog.push(prefix);
      }
    }
    const affected = dependencies.affectedByPresence(
      host.path,
      name,
      context.presenceMetrics,
      context,
      context.root.runtime,
    );
    for (const owner of affected.owners) {
      owners.add(owner);
      ownerStamps.set(owner, maxLite(ownerStamps.get(owner) ?? 0, stamp));
    }
    for (const owner of affected.stateOnly) stateOnly.add(owner);
    for (const template of affected.outerTemplates)
      marked =
        deferPresenceTemplate(template, 'outer', host.path, context, stamp) ||
        marked;
    for (const template of affected.directTemplates)
      marked =
        deferPresenceTemplate(template, 'direct', path, context, stamp) ||
        marked;
  }

  for (const owner of owners) {
    if (
      (owner !== $.Root && parentOf(owner) === host.path) ||
      evaluatedPresenceAfter(owner, ownerStamps.get(owner)!, context)
    ) {
      publishPresenceOwner(owner, context);
      continue;
    }
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
    const live = getLivePresenceNode(context.root, owner);
    if (!live) continue;
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
    if (!context.shapeDirtyPaths.has(ancestor)) {
      const cursors = (context.presenceQueryCursors ??= new Map());
      let cursor = cursors.get(ancestor);
      if (!cursor) {
        cursor = { changed: 0, prefixes: 0, index: 0 };
        cursors.set(ancestor, cursor);
      }
      if (
        registry.mayPresenceChangeAt(
          ancestor,
          accumulated,
          prefixes,
          changedLog,
          prefixLog,
          cursor,
          context.presenceMetrics,
        )
      ) {
        context.shapeDirtyPaths.add(ancestor);
        marked = true;
      }
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
