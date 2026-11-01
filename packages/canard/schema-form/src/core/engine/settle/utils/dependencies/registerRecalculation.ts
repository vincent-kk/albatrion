import type { Optional } from '@aileron/declare';

import {
  JSONPointer as $,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { engineModes } from '../../../utils/cache/engineModes';
import type { SettlementContext } from '../../types/settlement';
import { getGateRegistry } from '../gates/getGateRegistry';
import { verifyGateSelection } from '../gates/verifyGateSelection';
import { verifyWriteEpoch } from '../input/utils/verifyWriteEpoch';
import { DirtyPathSet } from '../scratch/DirtyPathSet';
import { getDependencyIndex } from './getDependencyIndex';

/**
 * Schedule changed nodes, ancestors, and blueprint reverse dependency owners.
 * @param context - Marked write with its changed raw paths
 * @returns Nothing; extends its bounded dirty path set
 */
export const registerRecalculation = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  if (context.writeEpoch !== undefined) {
    if (context.target.parent !== null)
      context.dirtyPaths.add(context.target.path);
    let parent = context.target.parent;
    while (parent) {
      context.dirtyPaths.add(parent.path);
      parent = parent.parent;
    }
    if (engineModes.gateSelection === 'verify') verifyWriteEpoch(context);
    return;
  }
  if (!context.hasGates && context.dirtyPaths instanceof DirtyPathSet)
    context.dirtyPaths.beginPostOrder();
  const blueprint = context.root.runtime.blueprint;
  const dependencies = getDependencyIndex(blueprint);
  const epoch = (context.registrationEpoch =
    (context.registrationEpoch ?? 0) + 1);
  const shadow =
    engineModes.gateSelection === 'verify' && !context.shadowRegistration
      ? context.registrationShadow
      : undefined;
  if (shadow) {
    registerRecalculation({
      ...context,
      dirtyPaths: shadow.dirty,
      dirtyChildrenByParent: shadow.dirty.childrenByParent,
      shapeDirtyPaths: shadow.shape,
      dependencyOwnerPaths: shadow.owners,
      registrationShadow: undefined,
      shadowRegistration: true,
    });
    shadow.registering = true;
  }
  const split =
    !context.shadowRegistration &&
    context.hasGates &&
    engineModes.gateSelection !== 'off' &&
    dependencies.hasSplitOwners;
  if (split) {
    const dirty = context.dirtyPaths;
    if (dirty instanceof DirtyPathSet)
      dirty.configureSplitOwners(dependencies.splitOwners);
    for (const changed of context.changedRaw)
      dependencies.affectedForRegistration(changed, context.root, {
        hit: (bucket, liveRanks) => {
          (context.splitHitEpochs ??= new Map()).set(bucket, epoch);
          return dirty instanceof DirtyPathSet
            ? dirty.planSplitAnchors(bucket, liveRanks, epoch)
            : [];
        },
        owner: (path, kind) => {
          dirty.add(path);
          if (kind === 'plain') context.dependencyOwnerPaths.add(path);
          else if (kind === 'split')
            (context.splitMarks ??= new Map()).set(path, epoch);
          context.shapeDirtyPaths.add(
            kind === 'host' ? path : resolvePointer(path, $.Parent),
          );
        },
      });
  } else {
    for (const changed of context.changedRaw)
      for (const declarationPath of dependencies.affected(
        changed,
        context.root,
      )) {
        context.dirtyPaths.add(declarationPath);
        context.dependencyOwnerPaths.add(declarationPath);
        context.shapeDirtyPaths.add(resolvePointer(declarationPath, $.Parent));
      }
  }
  const expanded = new Set<string>();
  for (const path of context.dirtyPaths) {
    let ancestor = path;
    while (ancestor && !expanded.has(ancestor)) {
      expanded.add(ancestor);
      ancestor = resolvePointer(ancestor, $.Parent);
      context.dirtyPaths.add(ancestor);
    }
  }
  if (context.hasGates) {
    const changedAncestors = new Set<string>();
    for (const changed of context.changedRaw)
      for (let prefix = changed; prefix; ) {
        prefix = resolvePointer(prefix, $.Parent);
        if (changedAncestors.has(prefix)) break;
        changedAncestors.add(prefix);
      }
    const registry = getGateRegistry(context.root.runtime);
    for (const path of context.dirtyPaths) {
      if (registry.mayChangeAt(path, context.changedRaw, changedAncestors))
        context.shapeDirtyPaths.add(path);
      if (
        path &&
        registry.mayChangeOwnDeclarationAt(
          path,
          context.changedRaw,
          changedAncestors,
        )
      )
        context.shapeDirtyPaths.add(resolvePointer(path, $.Parent));
    }
  }

  if (shadow) {
    shadow.registering = false;
    let matches = context.shapeDirtyPaths.size === shadow.shape.size;
    if (matches) {
      const shadowShapeEntries = [...shadow.shape];
      for (
        let index = 0, count = shadowShapeEntries.length;
        index < count;
        index++
      ) {
        const path = shadowShapeEntries[index];

        if (!context.shapeDirtyPaths.has(path)) {
          matches = false;
          break;
        }
      }
    }
    verifyGateSelection(matches, 'S3 shape dirty differs after registration');
    for (const path of context.dirtyPaths)
      verifyGateSelection(
        shadow.dirty.has(path),
        'S3 optimized dirty adds an unknown path: ' + path,
      );
    for (const path of shadow.dirty)
      if (!context.dirtyPaths.has(path)) {
        const owner = dependencies.splitOwners.get(path);
        verifyGateSelection(
          !!owner && !!context.splitHitEpochs?.has(owner.bucket),
          'S3 removed a non-split owner: ' + path,
        );
        let node: Optional<Self> = context.root;
        for (const segment of dependencies.pathSegments(
          path,
          context.root.runtime,
        )) {
          if (typeof segment !== 'string') {
            node = undefined;
            break;
          }
          node = node?.structure?.[segment];
        }
        verifyGateSelection(!node, 'S3 removed a living split owner: ' + path);
      }
  }
};
