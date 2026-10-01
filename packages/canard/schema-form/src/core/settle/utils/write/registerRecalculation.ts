import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { getGateRegistry } from '../gates/getGateRegistry';
import { getDependencyIndex } from './getDependencyIndex';

/**
 * Schedule changed nodes, ancestors, and blueprint reverse dependency owners.
 * @param context - Marked write with its changed raw paths
 * @returns Nothing; extends its bounded dirty path set
 */
export const registerRecalculation = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const blueprint = context.root.runtime.blueprint;
  const dependencies = getDependencyIndex(blueprint);
  for (const changed of context.changedRaw)
    for (const declarationPath of dependencies.affected(changed, context.root)) {
      context.dirtyPaths.add(declarationPath);
      context.dependencyOwnerPaths.add(declarationPath);
      context.shapeDirtyPaths.add(declarationPath.slice(0,
        declarationPath.lastIndexOf('/')));
    }
  for (const path of context.dirtyPaths) {
    let ancestor = path;
    while (ancestor) {
      ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
      context.dirtyPaths.add(ancestor);
    }
  }
  if (context.hasGates) {
    const changedAncestors = new Set<string>();
    for (const changed of context.changedRaw)
      for (let prefix = changed; prefix;) {
        prefix = prefix.slice(0, prefix.lastIndexOf('/'));
        if (changedAncestors.has(prefix)) break;
        changedAncestors.add(prefix);
      }
    const registry = getGateRegistry(context.root.runtime);
    for (const path of context.dirtyPaths) {
      if (registry.mayChangeAt(path, context.changedRaw, changedAncestors))
        context.shapeDirtyPaths.add(path);
      if (path && registry.mayChangeOwnDeclarationAt(path, context.changedRaw, changedAncestors))
        context.shapeDirtyPaths.add(path.slice(0, path.lastIndexOf('/')));
    }
  }
};
