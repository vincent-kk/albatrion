import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { getDependencyIndex } from '../write/getDependencyIndex';

/**
 * Select declaration hosts touched by changed paths or newly entered children.
 * @param context - Current changed raw paths and active appearance set
 * @returns Live source addresses for this non-load derive round
 */
export const collectDeriveSourcePaths = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): ReadonlySet<string> => {
  const paths = new Set<string>();
  for (const owner of context.contextOwners ?? []) paths.add(owner);
  const dependencies = getDependencyIndex(context.root.runtime.blueprint);
  for (const changed of context.changedRaw) {
    for (const owner of dependencies.affected(changed)) paths.add(owner);
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
  return paths;
};
