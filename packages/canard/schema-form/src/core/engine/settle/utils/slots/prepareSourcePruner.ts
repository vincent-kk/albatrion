import type { Nullable } from '@aileron/declare';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import { getSlotChildIndex } from './getSlotChildIndex';
import { pruneInactiveSources } from './pruneInactiveSources';

/** A live, unique-kind terminal has no retained source in its replacement scope. */
const skipSourcePruning: typeof pruneInactiveSources = () => {};

/**
 * Choose a source writer for a live occurrence's immutable lineage, deciding once in its `__isSourceScopeUnique__`.
 * @param node - Write target whose current lifetime and object ancestry are fixed
 * @returns A shared no-op for a terminal with no alternate kind along its path, otherwise the general scope pruner
 */
export const prepareSourcePruner = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): typeof pruneInactiveSources => {
  if (node.__isSourceScopeUnique__ !== undefined)
    return node.__isSourceScopeUnique__
      ? skipSourcePruning
      : pruneInactiveSources;
  let unique = !hasRetainableDescendants(node.blueprintNode, new WeakSet());
  for (
    let current: Nullable<Self> = node;
    unique && current?.__parent__;
    current = current.__parent__
  ) {
    const parent = current.__parent__;
    if (
      parent.behavior.type === 'array' &&
      !parent.blueprintNode.hasCandidateDescendants
    )
      continue;
    if (parent.behavior.type !== 'object') {
      unique = false;
      break;
    }
    if (!parent.blueprintNode.hasCandidateDescendants) continue;
    const derived = getHostDerived<
      'childOrderIndex',
      ReadonlyMap<string, ReadonlyMap<BlueprintNode, number>>
    >(parent.blueprintNode);
    getSlotChildIndex(
      parent.blueprintNode,
      current.name,
      current.blueprintNode,
    );
    const identity = getBlueprintNodeIdentity(current.blueprintNode);
    for (const template of derived.childOrderIndex?.get(current.name)?.keys() ??
      [])
      if (getBlueprintNodeIdentity(template) !== identity) unique = false;
  }
  node.__isSourceScopeUnique__ = unique;
  return unique ? skipSourcePruning : pruneInactiveSources;
};

/** Prove source-free descendants from the finite template graph without reading live slots. */
const hasRetainableDescendants = (
  template: BlueprintNode,
  visited: WeakSet<BlueprintNode>,
): boolean => {
  if (visited.has(template)) return false;
  visited.add(template);
  if (
    template.kind === 'virtual' ||
    template.kind === 'array' ||
    template.hasCandidateDescendants
  )
    return true;
  for (const entry of template.childEntries) {
    let hasUnconditionalDeclaration = false;
    for (const declaration of entry.declarations) {
      if (declaration.gates.length === 0) {
        hasUnconditionalDeclaration = true;
        break;
      }
    }
    if (
      !hasUnconditionalDeclaration ||
      hasRetainableDescendants(entry.node, visited)
    ) {
      return true;
    }
  }
  for (const child of [
    ...(template.prefixItems ?? []),
    ...(template.item ? [template.item] : []),
  ]) {
    let hasUnconditionalDeclaration = false;
    for (const declaration of child.declarations) {
      if (declaration.gates.length === 0) {
        hasUnconditionalDeclaration = true;
        break;
      }
    }
    if (
      !hasUnconditionalDeclaration ||
      hasRetainableDescendants(child, visited)
    ) {
      return true;
    }
  }
  return false;
};
