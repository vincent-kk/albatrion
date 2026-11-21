import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

/**
 * Expand declared fields into ordered storage addresses for a live or latent virtual group.
 * @param parentPath - Physical parent address of all constituents.
 * @param fields - Decoded declared sibling names in tuple order.
 * @param children - Live records in that parent, when the group has one.
 * @returns Each position and address, including positions without a live record.
 */
export const resolveVirtualStorageTargets = <Node>(
  parentPath: string,
  fields: readonly string[] | undefined,
  children?: Readonly<Record<string, Node>> | null,
): readonly { name: string; path: string; node: Node | undefined }[] =>
  fields?.map((name) => ({
    name,
    path: appendSegment(parentPath, name),
    node: children && hasOwnProperty(children, name) ? children[name] : undefined,
  })) ?? EMPTY_ARRAY;
