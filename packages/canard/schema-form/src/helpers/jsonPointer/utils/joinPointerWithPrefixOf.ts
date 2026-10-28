import type { PointerSegment } from '../constants/PointerOperator';
import { joinPointer } from './joinPointer';

/**
 * Assemble decoded segments while preserving the reference's fragment prefix.
 * @param reference - Address whose leading `#`, when present, is carried over.
 * @param segments - Decoded names or operator symbols accepted by joinPointer.
 * @returns The canonical pointer with the reference's fragment convention.
 */
export const joinPointerWithPrefixOf = (
  reference: string,
  segments: readonly PointerSegment[],
): string => (reference[0] === '#' ? '#' : '') + joinPointer(segments);
