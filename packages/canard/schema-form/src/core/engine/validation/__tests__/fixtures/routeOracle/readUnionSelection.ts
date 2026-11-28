import type { DispatchTestNode } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { SchemaFragment } from '@/schema-form/core/engine/blueprint';
import { bindPointerTemplate } from '@/schema-form/helpers/jsonPointer';

import { createUnionBranchActivity } from '../../../utils/route/createUnionBranchActivity';

/**
 * Selected branch of one union at one data occurrence.
 * @param path - Data path of the occurrence that hosts the union.
 * @param branches - The authored `oneOf`/`anyOf` array, by identity.
 * @returns The index of the only committed branch, or undefined when none or several are committed.
 */
export type UnionSelection = (
  path: string,
  branches: readonly unknown[],
) => number | undefined;

/**
 * Read the committed branch of every union host in a mounted tree. A branch is matched to
 * its fragments by the authored object identity and to the occurrence by the fragment's
 * host template, so no schema path is compared.
 * @param root - Mounted root whose committed declarations are current.
 * @returns A lookup by occurrence path and authored branch array.
 */
export const readUnionSelection = (root: DispatchTestNode): UnionSelection => {
  const isActive = createUnionBranchActivity(root);
  const fragments = new Map<unknown, SchemaFragment[]>();
  for (const fragment of root.runtime.blueprint.fragments) {
    const list = fragments.get(fragment.schema);
    if (list) list.push(fragment);
    else fragments.set(fragment.schema, [fragment]);
  }
  const nodes = new Map<string, DispatchTestNode>();
  const pending = [root];
  for (let node = pending.pop(); node; node = pending.pop()) {
    nodes.set(node.path, node);
    pending.push(...(node.children ?? []));
  }
  return (path, branches) => {
    const host = nodes.get(path);
    if (!host) return undefined;
    const active: number[] = [];
    branches.forEach((branch, index) => {
      const hosted = (fragments.get(branch) ?? []).filter(
        (fragment) =>
          fragment.hostPath === host.blueprintNode.path ||
          bindPointerTemplate(fragment.hostPath, host.path) === host.path,
      );
      if (hosted.some((fragment) => isActive(fragment, host)))
        active.push(index);
    });
    return active.length === 1 ? active[0] : undefined;
  };
};
