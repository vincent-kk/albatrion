import {
  JSONPointer as $,
  JSONPointerPrefix,
} from '@/schema-form/helpers/jsonPointer';

/** Parsed address and the tree on which its first segment is resolved. */
export interface FieldNodePath {
  /** Whether navigation starts at the live root. */
  readonly absolute: boolean;
  /** Pointer segments, still encoded as JSON Pointer tokens. */
  readonly segments: readonly string[];
}

/** Parse a node pointer without looking at the tree or changing node state. */
export const getFieldNodePath = (
  pointer?: string | readonly string[] | null,
): FieldNodePath => {
  if (pointer == null || pointer === '')
    return { absolute: false, segments: [] };
  if (typeof pointer !== 'string') {
    const absolute = pointer[0] === $.Fragment;
    return { absolute, segments: absolute ? pointer.slice(1) : pointer };
  }
  if (pointer === $.Fragment) return { absolute: true, segments: [] };
  if (pointer.startsWith(JSONPointerPrefix.Fragment))
    return { absolute: true, segments: pointer.slice(2).split($.Separator) };
  if (pointer.startsWith($.Separator))
    return { absolute: true, segments: pointer.slice(1).split($.Separator) };
  return { absolute: false, segments: pointer.split($.Separator) };
};
