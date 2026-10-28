import {
  PointerOperator,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';
import type { FieldInputTestFn } from '@/schema-form/types';

/** Match pointer segments, allowing a wildcard to consume one segment. */
export const fieldInputTestFnFactory = (path: string): FieldInputTestFn => {
  const segments = parsePointerSegments(path);
  return (hint) => {
    const hintSegments = parsePointerSegments(hint.path);
    if (segments.length !== hintSegments.length) return false;
    for (let i = 0, l = segments.length; i < l; i++) {
      const segment = segments[i];
      const hintSegment = hintSegments[i];
      if (segment === PointerOperator.Wildcard) continue;
      else if (segment !== hintSegment) return false;
    }
    return true;
  };
};
