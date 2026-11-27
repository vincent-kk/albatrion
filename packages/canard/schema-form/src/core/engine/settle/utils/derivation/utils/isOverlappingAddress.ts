import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

/**
 * Compare two storage addresses after any virtual expansion.
 * @param left - First canonical storage path
 * @param right - Second canonical storage path
 * @returns Whether either write can reach the other's address
 */
export const isOverlappingAddress = (left: string, right: string): boolean =>
  left === right ||
  isDescendantPath(left, right) ||
  isDescendantPath(right, left);
