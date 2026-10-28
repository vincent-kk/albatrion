import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  PointerOperator,
  isAbsolutePointer,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';

/** Resolve every current-shape match in path order, retaining each instance once. */
export const findNodes = <Self extends FieldNodeRecord<Self>>(
  origin: Self,
  pointer?: string | readonly string[] | null,
): readonly Self[] => {
  const input = pointer ?? '';
  const segments = parsePointerSegments(input);
  let cursors: Self[] = [isAbsolutePointer(input) ? origin.rootNode : origin];

  for (const token of segments) {
    const next: Self[] = [];
    if (token === PointerOperator.Context) return [];
    for (const cursor of cursors) {
      if (token === PointerOperator.Current) {
        if (!next.includes(cursor)) next.push(cursor);
      } else if (token === PointerOperator.Parent) {
        const parent = cursor.parent;
        if (
          parent !== null &&
          (!cursor.detached || parent.detached) &&
          !next.includes(parent)
        )
          next.push(parent);
      } else if (cursor.structure !== null) {
        if (token === PointerOperator.Wildcard) {
          for (const child of Object.values(cursor.structure))
            if (!next.includes(child)) next.push(child);
        } else {
          if (typeof token !== 'string') continue;
          const name = token;
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
