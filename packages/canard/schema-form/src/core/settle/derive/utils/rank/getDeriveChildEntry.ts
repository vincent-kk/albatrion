import type { BlueprintNode, BlueprintNodeKind } from '../../../../blueprint';

/** Immutable template indexes are built once when a rule first uses the host. */
const CHILDREN = new WeakMap<BlueprintNode, ReadonlyMap<string, readonly number[]>>();

/**
 * Find a declared child without rescanning a wide host on every injection.
 * @param parent - Immutable analyzed host template
 * @param name - Decoded direct child name
 * @param kind - Optional live kind for a same-name declaration
 * @returns First matching edge and its document position
 */
export const getDeriveChildEntry = (
  parent: BlueprintNode, name: string, kind?: BlueprintNodeKind,
) => {
  let index = CHILDREN.get(parent);
  if (!index) {
    const built = new Map<string, number[]>();
    parent.childEntries.forEach((entry, position) => {
      const positions = built.get(entry.name) ?? [];
      positions.push(position);
      built.set(entry.name, positions);
    });
    index = built;
    CHILDREN.set(parent, index);
  }
  const positions = index.get(name);
  const position = kind ? positions?.find((candidate) =>
    parent.childEntries[candidate].node.kind === kind) : positions?.[0];
  return position === undefined ? undefined :
    { entry: parent.childEntries[position], position };
};
