import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { getDependencyIndex } from '../write/getDependencyIndex';

/**
 * Select hosts touched by raw changes, new children, or declaration selection.
 * @param context - Changed raw paths, entered nodes, and selected declarations
 * @returns Live source addresses for this non-load derive round
 */
export const collectDeriveSourcePaths = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): ReadonlySet<string> => {
  const paths = new Set<string>();
  for (const owner of context.contextOwners ?? []) paths.add(owner);
  const dependencies = getDependencyIndex(context.root.runtime.blueprint);
  for (const changed of context.changedRaw) {
    for (const owner of dependencies.affected(changed, context.root)) paths.add(owner);
    let path = changed;
    while (true) {
      paths.add(path);
      if (!path) break;
      path = path.slice(0, path.lastIndexOf('/'));
    }
  }
  for (const node of context.entered) {
    paths.add(node.path);
    if (node.parent) paths.add(node.parent.path);
  }
  for (const [node, ids] of context.selectedDeclarationIds) {
    const previous = node.runtime.committedDeclarationIds?.get(
      JSON.stringify([node.path, node.blueprintNode.kind]));
    if (!previous || previous.length !== ids.length ||
      previous.some((id, index) => id !== ids[index])) paths.add(node.path);
  }
  return paths;
};
