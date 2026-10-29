import {
  JSONPointer as $,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { getDependencyIndex } from '../dependencies/getDependencyIndex';

/**
 * Select hosts touched by raw changes, new children, or declaration selection.
 * @param context - Changed raw paths, entered nodes, and selected declarations
 * @returns Live source addresses for this non-load derive round
 */
export const collectDeriveSourcePaths = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): ReadonlySet<string> => {
  const paths = new Set<string>();
  for (const owner of context.contextOwners ?? []) paths.add(owner);
  const dependencies = getDependencyIndex(context.root.runtime.blueprint);
  for (const changed of context.changedRaw) {
    for (const owner of dependencies.affected(changed, context.root))
      paths.add(owner);
    let path = changed;
    while (true) {
      paths.add(path);
      if (!path) break;
      path = resolvePointer(path, $.Parent);
    }
  }
  for (const node of context.entered) {
    paths.add(node.path);
    if (node.parent) paths.add(node.parent.path);
  }
  for (const [node, ids] of context.selectedDeclarationIds) {
    const previous = node.runtime.committedDeclarationIds?.get(
      JSON.stringify([node.path, getBlueprintNodeIdentity(node.blueprintNode)]),
    );
    if (
      !previous ||
      previous.length !== ids.length ||
      (() => {
        const items = previous;
        for (
          let position = 0, count = items.length;
          position < count;
          position++
        ) {
          if (!(position in items)) continue;
          const id = items[position];
          const index = position;
          if (id !== ids[index]) return true;
        }
        return false;
      })()
    )
      paths.add(node.path);
  }
  return paths;
};
