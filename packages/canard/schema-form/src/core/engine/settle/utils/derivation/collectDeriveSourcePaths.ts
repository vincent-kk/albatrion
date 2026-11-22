import {
  JSONPointer as $,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { getAliasedDependencyIndex } from '../dependencies/getAliasedDependencyIndex';
import { getDependencyIndex } from '../dependencies/getDependencyIndex';

/**
 * Select hosts touched by source changes, new or exiting children, or declaration selection.
 * @param context - Changed source paths, entered and pending-exit nodes, and selected declarations
 * @returns Live source addresses for this non-load derive round
 */
export const collectDeriveSourcePaths = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): ReadonlySet<string> => {
  const paths = new Set<string>();
  const aliases = context.root.runtime.blueprint.capabilities.hasAliasedDependencies ? getAliasedDependencyIndex(context) : undefined;
  for (const owner of context.contextOwners ?? []) paths.add(owner);
  const dependencies = getDependencyIndex(context.root.runtime.blueprint);
  for (const changed of context.changedSource) {
    for (const owner of dependencies.affectedOwners(changed, context.root))
      paths.add(owner);
    if (aliases)
      for (const owner of aliases.affectedOwners(changed)) paths.add(owner);
    let path = changed;
    while (true) {
      paths.add(path);
      if (!path) break;
      path = resolvePointer(path, $.Parent);
    }
  }
  for (const node of context.enteredNodes) {
    paths.add(node.path);
    if (node.parent) paths.add(node.parent.path);
  }
  // A gate exit changes only the emitted tree, so readers of an exited subtree are hosts too.
  // Exits stay in pendingExits during the rounds; exitedNodes fills only after them.
  if (context.pendingExits.size) {
    const exits = new Set<Self>(context.pendingExits.values());
    for (const node of exits)
      if (!node.parent || !exits.has(node.parent)) {
        for (const owner of dependencies.affectedOwners(
          node.path,
          context.root,
        ))
          paths.add(owner);
        if (aliases)
          for (const owner of aliases.affectedOwners(node.path))
            paths.add(owner);
      }
  }
  for (const [node, ids] of context.selectedDeclarationIds) {
    const previous = node.runtime.committedDeclarationIds?.get(
      JSON.stringify([node.path, getBlueprintNodeIdentity(node.blueprintNode)]),
    );
    let haveSourceIdsChanged = !previous || previous.length !== ids.length;
    if (previous && previous.length === ids.length)
      for (let index = 0; index < previous.length; index++)
        if (previous[index] !== ids[index]) {
          haveSourceIdsChanged = true;
          break;
        }
    if (haveSourceIdsChanged) {
      paths.add(node.path);
    }
  }
  return paths;
};
