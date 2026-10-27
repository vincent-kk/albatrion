import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { BlueprintNode } from '../../../blueprint';
import { CONTROL_KEY } from '../../../constants/controlKey';
import { prepareControlLayers } from './prepareControlLayers';
import { prepareFragmentOwners } from './prepareFragmentOwners';
import type {
  PreparedControlGroups,
  PreparedControlLayer,
} from './preparedControlLayers';

/** Parents with no addressing controls need no per-child bindings. */
const EMPTY_GROUPS: PreparedControlGroups = Object.freeze({
  all: [],
  exit: [],
});

/**
 * Bind sparse parent groups to immutable child ownership and name facts.
 * @param parent - Declaring template, shared by all live occurrences
 * @param node - Child template whose declarations establish fragment ownership
 * @param name - Decoded child edge name used by fields targets
 * @returns Cached groups in authored order, with a separate exit-only subset
 */
export const prepareParentControlLayers = (
  parent: BlueprintNode,
  node: BlueprintNode,
  name: string,
): PreparedControlGroups => {
  const index = prepareControlLayers(parent);
  if (!index.fields.size && !index.fragments.size) return EMPTY_GROUPS;
  const targetName = index.fields.has(name) ? name : undefined;
  const bindings = (index.targets ??= new WeakMap());
  let targets = bindings.get(node);
  if (!targets) bindings.set(node, (targets = new Map()));
  const previous = targets.get(targetName);
  if (previous) return previous;
  const groups: PreparedControlLayer[] = [...(index.fields.get(name) ?? [])];
  if (index.fragments.size)
    for (const [path, ownerIds] of prepareFragmentOwners(node))
      for (const fragment of index.fragments.get(path) ?? [])
        groups.push({ ...fragment, ownerIds });
  groups.sort((left, right) => left.order - right.order);
  const prepared = {
    all: groups,
    exit: groups.filter((group) =>
      hasOwnProperty(group.controls, CONTROL_KEY.unsetOnInactive),
    ),
  };
  targets.set(targetName, prepared);
  return prepared;
};
