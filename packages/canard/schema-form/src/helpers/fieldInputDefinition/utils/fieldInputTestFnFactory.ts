import {
  JSONPointer as $,
  stripFragment,
} from '@/schema-form/helpers/jsonPointer';
import type { FieldInputTestFn } from '@/schema-form/types';

/** Match pointer segments, allowing a wildcard to consume one segment. */
export const fieldInputTestFnFactory = (path: string): FieldInputTestFn => {
  const segments = stripFragment(path).split($.Separator);
  return (hint) => {
    const hintSegments = hint.path.split($.Separator);
    if (segments.length !== hintSegments.length) return false;
    for (let i = 0, l = segments.length; i < l; i++) {
      const segment = segments[i];
      const hintSegment = hintSegments[i];
      if (segment === $.Wildcard) continue;
      else if (segment !== hintSegment) return false;
    }
    return true;
  };
};
