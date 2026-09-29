import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { SchemaNodeRecord } from '../../../record';
import { getSchemaNodePath } from './utils/getSchemaNodePath';

/** Resolve every current-shape match in path order, retaining each instance once. */
export const findNodes = <Self extends SchemaNodeRecord<Self>>(
  origin: Self,
  pointer: string | readonly string[] | null,
): readonly Self[] => {
  const path = getSchemaNodePath(pointer);
  let cursors: Self[] = [path.absolute ? origin.rootNode : origin];

  for (const token of path.segments) {
    const next: Self[] = [];
    if (token === '@') return [];
    for (const cursor of cursors) {
      if (token === '.') {
        if (!next.includes(cursor)) next.push(cursor);
      } else if (token === '..') {
        const parent = cursor.parent;
        if (
          parent !== null &&
          (!cursor.detached || parent.detached) &&
          !next.includes(parent)
        )
          next.push(parent);
      } else if (cursor.structure !== null) {
        if (token === '*') {
          for (const child of Object.values(cursor.structure))
            if (!next.includes(child)) next.push(child);
        } else {
          const name = token.replace(/~1/g, '/').replace(/~0/g, '~');
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
