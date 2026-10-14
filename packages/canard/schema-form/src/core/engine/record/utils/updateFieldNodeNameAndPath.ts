import { SLASH_REGEX, TILDE_REGEX } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../types/record';
import { captureFieldNodeChange } from './captureFieldNodeChange';

/** Rebind a node's direct identity; callers rebind affected descendants separately. */
export const updateFieldNodeNameAndPath = <
  Self extends { path: string; depth: number },
>(
  node: FieldNodeRecord<Self>,
  name: string,
  parent: Self | null,
): void => {
  node.parent = parent;
  node.name = name;
  node.escapedName = name.replace(TILDE_REGEX, '~0').replace(SLASH_REGEX, '~1');
  node.path = captureFieldNodeChange(
    node,
    'path',
    parent === null ? '' : parent.path + '/' + node.escapedName,
  );
  node.depth = parent === null ? 0 : parent.depth + 1;
};
