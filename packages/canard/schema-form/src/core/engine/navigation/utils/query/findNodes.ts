import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  JSONPointer as $,
  ESCAPED_SLASH_REGEX,
  ESCAPED_TILDE_REGEX,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { getFieldNodePath } from './utils/getFieldNodePath';

/** Resolve every current-shape match in path order, retaining each instance once. */
export const findNodes = <Self extends FieldNodeRecord<Self>>(
  origin: Self,
  pointer?: string | readonly string[] | null,
): readonly Self[] => {
  const path = getFieldNodePath(pointer);
  let cursors: Self[] = [path.absolute ? origin.rootNode : origin];

  for (const token of path.segments) {
    const next: Self[] = [];
    if (token === $.Context) return [];
    for (const cursor of cursors) {
      if (token === $.Current) {
        if (!next.includes(cursor)) next.push(cursor);
      } else if (token === $.Parent) {
        const parent = cursor.parent;
        if (
          parent !== null &&
          (!cursor.detached || parent.detached) &&
          !next.includes(parent)
        )
          next.push(parent);
      } else if (cursor.structure !== null) {
        if (token === $.Wildcard) {
          for (const child of Object.values(cursor.structure))
            if (!next.includes(child)) next.push(child);
        } else {
          const name = token
            .replace(ESCAPED_SLASH_REGEX, $.Separator)
            .replace(ESCAPED_TILDE_REGEX, '~');
          if (hasOwnProperty(cursor.structure, name)) {
            const child = cursor.structure[name];
            if (child !== undefined && !next.includes(child)) next.push(child);
          }
        }
      }
    }
    if (next.length === 0) return [];
    cursors = next;
  }
  return cursors;
};
