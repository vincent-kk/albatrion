import { FieldNodeEventType } from '../../../record';
import type { FieldNodeRecord } from '../../../record';

/** Resolve navigation's query against the last committed child lists. */
export const hasPreviousSlotWildcardMatch = <
  Self extends FieldNodeRecord<Self>,
>(
  root: Self,
  path: string,
): boolean => {
  let cursors: readonly Self[] = [root];
  for (const segment of path.split('/').slice(1)) {
    if (segment === '@') return false;
    const next: Self[] = [];
    const name = segment.replace(/~1/g, '/').replace(/~0/g, '~');
    for (const cursor of cursors) {
      if (segment === '.') {
        if (!next.includes(cursor)) next.push(cursor);
        continue;
      }
      if (segment === '..') {
        if (cursor.parent && !next.includes(cursor.parent))
          next.push(cursor.parent);
        continue;
      }
      const children =
        cursor.deliveryChanges & FieldNodeEventType.UpdateChildren
          ? cursor.deliveryPreviousChildren
          : cursor.children;
      for (const child of children ?? []) {
        const previousPath = child.deliveryPreviousPath;
        const childName =
          previousPath !== undefined
            ? previousPath
                .slice(previousPath.lastIndexOf('/') + 1)
                .replace(/~1/g, '/')
                .replace(/~0/g, '~')
            : child.name;
        if ((segment === '*' || childName === name) && !next.includes(child))
          next.push(child);
      }
    }
    if (!next.length) return false;
    cursors = next;
  }
  return cursors.length > 0;
};
