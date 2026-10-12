/** Parsed address and the tree on which its first segment is resolved. */
export interface SchemaNodePath {
  /** Whether navigation starts at the live root. */
  readonly absolute: boolean;
  /** Pointer segments, still encoded as JSON Pointer tokens. */
  readonly segments: readonly string[];
}

/** Parse a node pointer without looking at the tree or changing node state. */
export const getSchemaNodePath = (
  pointer?: string | readonly string[] | null,
): SchemaNodePath => {
  if (pointer == null || pointer === '') return { absolute: false, segments: [] };
  if (typeof pointer !== 'string') {
    const absolute = pointer[0] === '#';
    return { absolute, segments: absolute ? pointer.slice(1) : pointer };
  }
  if (pointer === '#') return { absolute: true, segments: [] };
  if (pointer.startsWith('#/'))
    return { absolute: true, segments: pointer.slice(2).split('/') };
  if (pointer.startsWith('/'))
    return { absolute: true, segments: pointer.slice(1).split('/') };
  return { absolute: false, segments: pointer.split('/') };
};
