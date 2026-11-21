import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Nullable } from '@aileron/declare';

import {
  JSONPointer as $,
  PointerOperator,
  isAbsolutePointer,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';

/** Repeated membership checks amortize a shared index beyond this measured result size. */
const INDEX_THRESHOLD = 256;

/** Resolve every current-shape match in path order, retaining each instance once. */
export const findNodes = <Self extends FieldNodeRecord<Self>>(
  origin: Self,
  pointer?: Nullable<string | readonly string[]>,
): readonly Self[] => {
  const input = pointer ?? $.Root;
  const segments = parsePointerSegments(input);
  let cursors: Self[] = [isAbsolutePointer(input) ? origin.rootNode : origin];

  for (const token of segments) {
    const next: Self[] = [];
    let seen: Set<Self> | undefined;
    if (token === PointerOperator.Context) return [];
    for (const cursor of cursors) {
      if (token === PointerOperator.Current) {
        if (
          next.length === 0 ||
          (seen ? !seen.has(cursor) : next.indexOf(cursor) === -1)
        ) {
          next.push(cursor);
          if (seen) seen.add(cursor);
          else if (next.length === INDEX_THRESHOLD) seen = new Set(next);
        }
      } else if (token === PointerOperator.Parent) {
        const parent = cursor.parent;
        if (
          parent !== null &&
          (!cursor.isDetached || parent.isDetached) &&
          (next.length === 0 ||
            (seen ? !seen.has(parent) : next.indexOf(parent) === -1))
        ) {
          next.push(parent);
          if (seen) seen.add(parent);
          else if (next.length === INDEX_THRESHOLD) seen = new Set(next);
        }
      } else if (cursor.childrenByName !== null) {
        if (token === PointerOperator.Wildcard) {
          for (const child of Object.values(cursor.childrenByName))
            if (
              next.length === 0 ||
              (seen ? !seen.has(child) : next.indexOf(child) === -1)
            ) {
              next.push(child);
              if (seen) seen.add(child);
              else if (next.length === INDEX_THRESHOLD) seen = new Set(next);
            }
        } else {
          if (typeof token !== 'string') continue;
          const name = token;
          if (hasOwnProperty(cursor.childrenByName, name)) {
            const child = cursor.childrenByName[name];
            if (
              child !== undefined &&
              (next.length === 0 ||
                (seen ? !seen.has(child) : next.indexOf(child) === -1))
            ) {
              next.push(child);
              if (seen) seen.add(child);
              else if (next.length === INDEX_THRESHOLD) seen = new Set(next);
            }
          }
        }
      }
    }
    if (next.length === 0) return [];
    cursors = next;
  }
  return cursors;
};
