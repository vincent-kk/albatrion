import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

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
    readonly parent: {
      readonly path: string;
      readonly childrenByName: Readonly<Record<string, Node>> | null;
    } | null;
  },
>(
  node: Node,
):
  | readonly { name: string; path: string; node: Node | undefined }[]
  | undefined => {
  if (node.behavior.type !== 'virtual') return undefined;
  const parent = node.parent;
  if (!parent) return EMPTY_ARRAY;
  return (node.blueprintNode.fields ?? EMPTY_ARRAY).map((name) => ({
    name,
    path: appendSegment(parent.path, name),
    node:
      parent.childrenByName && hasOwnProperty(parent.childrenByName, name)
        ? parent.childrenByName[name]
        : undefined,
  }));
};
