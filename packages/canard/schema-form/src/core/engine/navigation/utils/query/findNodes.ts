import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Nullable } from '@aileron/declare';

import {
  JSONPointer as $,
  PointerOperator,
  isAbsolutePointer,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';

/** Candidate count at which indexed deduplication avoids quadratic scanning. */
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
    if (token === PointerOperator.Context) return [];
    for (const cursor of cursors) {
      if (token === PointerOperator.Current) next.push(cursor);
      else if (token === PointerOperator.Parent) {
        const parent = cursor.parent;
        if (parent !== null && (!cursor.isDetached || parent.isDetached))
          next.push(parent);
      } else if (cursor.childrenByName !== null) {
        if (token === PointerOperator.Wildcard) {
          for (const child of Object.values(cursor.childrenByName))
            next.push(child);
        } else if (
          typeof token === 'string' &&
          hasOwnProperty(cursor.childrenByName, token)
        ) {
          const child = cursor.childrenByName[token];
          if (child !== undefined) next.push(child);
        }
      }
    }
    if (next.length === 0) return [];
    cursors =
      next.length < 2
        ? next
        : next.length >= INDEX_THRESHOLD
          ? [...new Set(next)]
          : next.filter((node, index) => next.indexOf(node) === index);
  }
  return cursors;
};
