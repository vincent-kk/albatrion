import { isArray } from '@winglet/common-utils/filter';

/**
 * Describe an array slot by slot so holes, undefined and NaN stay distinct.
 * @param value - Any committed value
 * @returns Per-slot markers for arrays, or the value itself
 */
export const slotsOf = (value: unknown): unknown =>
  isArray(value)
    ? Array.from({ length: value.length }, (_, index) =>
        index in value
          ? Number.isNaN(value[index])
            ? 'NaN'
            : value[index] === undefined
              ? 'undefined'
              : value[index]
          : 'hole',
      )
    : value;
