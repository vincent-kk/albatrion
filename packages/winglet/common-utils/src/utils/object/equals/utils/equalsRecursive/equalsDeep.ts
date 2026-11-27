import { OBJECT_TAG } from '@/common-utils/constant/typeTag';
import { getTypeTag } from '@/common-utils/libs/getTypeTag';
import { hasOwnProperty } from '@/common-utils/libs/hasOwnProperty';

import { countRetainedKeys } from '../countRetainedKeys';
import { equalsBuiltin } from '../equalsBuiltin';

/**
 * Sentinel used to bypass internal-state tag checks for current-realm
 * literal-prototype pairs.
 */
const OBJECT_PROTOTYPE = Object.prototype;

/** Progress through one container pair that is active on the current comparison path. */
interface CursorProgress {
  /** Left container, paired with `rightOwner` while the cursor is on the stack. */
  leftOwner: object;
  /** Right container paired with `leftOwner`. */
  rightOwner: object;
  /** Next position, or index into `keys`, to read. */
  index: number;
  /** Number of positions or keys to read; always greater than zero. */
  length: number;
}

/** Cursor over values read by position: array elements, or the value lists of two Maps. */
interface PositionCursor extends CursorProgress {
  /** Marks a positional cursor. */
  keys: null;
  /** Left array, or the left Map's values in iteration order. */
  leftSource: ArrayLike<unknown>;
  /** Right array, or the right Map's values for the same keys. */
  rightSource: ArrayLike<unknown>;
}

/** Cursor over the own enumerable string keys of the left container. */
interface KeyCursor extends CursorProgress {
  /** Left own enumerable string keys, read in order. */
  keys: string[];
  /** Key-based view of the left container. */
  leftSource: Record<string, unknown>;
  /** Key-based view of the right container. */
  rightSource: Record<string, unknown>;
}

/** Either kind of cursor; `keys` tells them apart. */
type PairCursor = PositionCursor | KeyCursor;

/**
 * Continues an `equals` comparison past the recursion limit on an explicit cursor stack,
 * so deep plain objects and arrays are not bound by the call stack.
 *
 * Each active container pair keeps one cursor, and its values are read one at a time,
 * front to back. The first mismatch ends the comparison, so values after it are never
 * read. Map values are collected through `equalsBuiltin` when their pair is entered and
 * then compared in the Map's iteration order.
 *
 * @param left - Left object at the recursion limit; never identical to `right`
 * @param right - Right object at the same position
 * @param omits - Object keys excluded at every depth, or `null` for none
 * @returns Whether every retained value and built-in state matches
 * @throws {RangeError} When a container pair repeats on the current comparison path
 */
export const equalsDeep = (
  left: object,
  right: object,
  omits: Set<PropertyKey> | null,
): boolean => {
  const cursors: PairCursor[] = [];
  const active = new Map<object, object>();
  let repeatedLeft: WeakMap<object, Set<object>> | undefined;
  let nextLeft = left;
  let nextRight = right;
  for (;;) {
    const leftContainer = nextLeft;
    const rightContainer = nextRight;
    const leftArray = Array.isArray(leftContainer) ? leftContainer : null;
    const rightArray = Array.isArray(rightContainer) ? rightContainer : null;
    if ((leftArray === null) !== (rightArray === null)) return false;
    const counterparts = repeatedLeft?.get(leftContainer);
    const first = active.get(leftContainer);
    if (
      counterparts ? counterparts.has(rightContainer) : first === rightContainer
    )
      throw new RangeError(
        'equals input contains a repeated active comparison',
      );
    let cursor: PairCursor | undefined;
    if (leftArray !== null && rightArray !== null) {
      const length = leftArray.length;
      if (length !== rightArray.length) return false;
      if (length > 0)
        cursor = {
          leftOwner: leftContainer,
          rightOwner: rightContainer,
          keys: null,
          leftSource: leftArray,
          rightSource: rightArray,
          index: 0,
          length,
        };
    } else {
      let byState: boolean | undefined;
      if (
        Object.getPrototypeOf(leftContainer) !== OBJECT_PROTOTYPE ||
        Object.getPrototypeOf(rightContainer) !== OBJECT_PROTOTYPE
      ) {
        const tag = getTypeTag(leftContainer);
        if (tag !== getTypeTag(rightContainer)) return false;
        if (tag !== OBJECT_TAG) {
          const leftValues: unknown[] = [];
          const rightValues: unknown[] = [];
          byState = equalsBuiltin(
            leftContainer,
            rightContainer,
            tag,
            (leftValue, rightValue) => {
              leftValues.push(leftValue);
              rightValues.push(rightValue);
              return true;
            },
          );
          if (byState === false) return false;
          if (byState === true && leftValues.length > 0)
            cursor = {
              leftOwner: leftContainer,
              rightOwner: rightContainer,
              keys: null,
              leftSource: leftValues,
              rightSource: rightValues,
              index: 0,
              length: leftValues.length,
            };
        }
      }
      if (byState === undefined) {
        const keys = Object.keys(leftContainer);
        const rightKeys = Object.keys(rightContainer);
        if (
          omits === null
            ? keys.length !== rightKeys.length
            : countRetainedKeys(keys, omits) !==
              countRetainedKeys(rightKeys, omits)
        )
          return false;
        if (keys.length > 0)
          cursor = {
            leftOwner: leftContainer,
            rightOwner: rightContainer,
            keys,
            leftSource: leftContainer as Record<string, unknown>,
            rightSource: rightContainer as Record<string, unknown>,
            index: 0,
            length: keys.length,
          };
      }
    }
    if (cursor !== undefined) {
      if (counterparts) counterparts.add(rightContainer);
      else if (first) {
        repeatedLeft ??= new WeakMap();
        repeatedLeft.set(leftContainer, new Set([first, rightContainer]));
      } else active.set(leftContainer, rightContainer);
      cursors.push(cursor);
    }
    for (;;) {
      if (cursors.length === 0) return true;
      const top = cursors[cursors.length - 1];
      const index = top.index;
      if (index === top.length) {
        cursors.pop();
        releasePair(active, repeatedLeft, top);
        continue;
      }
      top.index = index + 1;
      let leftValue: unknown;
      let rightValue: unknown;
      if (top.keys === null) {
        leftValue = top.leftSource[index];
        rightValue = top.rightSource[index];
      } else {
        const key = top.keys[index];
        if (omits !== null && omits.has(key)) continue;
        if (!hasOwnProperty(top.rightSource, key)) return false;
        leftValue = top.leftSource[key];
        rightValue = top.rightSource[key];
      }
      if (
        leftValue === rightValue ||
        (leftValue !== leftValue && rightValue !== rightValue)
      )
        continue;
      if (
        leftValue === null ||
        rightValue === null ||
        typeof leftValue !== 'object' ||
        typeof rightValue !== 'object'
      )
        return false;
      nextLeft = leftValue;
      nextRight = rightValue;
      break;
    }
  }
};

/**
 * Ends the pairing of a finished cursor's containers on the current path, so the same
 * pair may be compared again on another path.
 *
 * @param active - First right counterpart of each active left container
 * @param repeatedLeft - Every right counterpart of a left container active more than once
 * @param cursor - Cursor that has read all of its positions or keys
 */
const releasePair = (
  active: Map<object, object>,
  repeatedLeft: WeakMap<object, Set<object>> | undefined,
  cursor: PairCursor,
): void => {
  const counterparts = repeatedLeft?.get(cursor.leftOwner);
  if (counterparts !== undefined) {
    counterparts.delete(cursor.rightOwner);
    if (counterparts.size) return;
    repeatedLeft?.delete(cursor.leftOwner);
  }
  active.delete(cursor.leftOwner);
};
