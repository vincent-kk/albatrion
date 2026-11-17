import { map as mapArray } from '@winglet/common-utils/array';

import type { FieldNode } from '@/schema-form/core';

import { CHILD_ERROR_EVENTS } from './childErrorEvents';

/**
 * Read the complete current parent and child revision vector.
 * @param node - Container whose current direct children participate in the view
 * @returns The same joined revision representation used before subscription
 */
export const readChildErrorSnapshot = (node: FieldNode): string =>
  mapArray([node, ...(node.children ?? [])], (child) =>
    child.revision(CHILD_ERROR_EVENTS),
  ).join(':');
