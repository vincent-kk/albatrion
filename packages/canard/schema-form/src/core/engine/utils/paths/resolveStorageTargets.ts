import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import { resolveVirtualStorageTargets } from './resolveVirtualStorageTargets';
import type { StorageTarget } from './resolveVirtualStorageTargets';

export type { StorageTarget } from './resolveVirtualStorageTargets';

/**
 * Expand a virtual address into its ordered physical storage fields.
 * @param node - Current occurrence; its parent owns the referenced sibling fields.
 * @returns Undefined for a direct address, otherwise every tuple slot with its canonical path
 * and its live node when present. The caller's records and arrays are never changed.
 */
export const resolveStorageTargets = <
  Node extends {
    readonly behavior: { readonly type: string };
    readonly blueprintNode: { readonly fields?: readonly string[] };
    readonly __parent__: {
      readonly path: string;
      readonly __childrenByName__: Readonly<Record<string, Node>> | null;
    } | null;
  },
>(
  node: Node,
): readonly StorageTarget<Node>[] | undefined => {
  if (node.behavior.type !== 'virtual') return undefined;
  const parent = node.__parent__;
  if (!parent) return EMPTY_ARRAY;
  return resolveVirtualStorageTargets(
    parent.path,
    node.blueprintNode.fields,
    parent.__childrenByName__,
  );
};
