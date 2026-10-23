/** Keywords whose next segment names a directly declared child. */
const NAMED_CHILD_MARKERS = ['/properties/', '/prefixItems/'] as const;

/** Keywords whose own subschema declares the directly declared array item. */
const ITEM_MARKERS = ['/items', '/additionalItems'] as const;

/** Whether a keyword ending at `end` closes the path or is followed by a segment. */
const endsSegment = (schemaPath: string, end: number): boolean =>
  end === schemaPath.length || schemaPath[end] === '/';

/** Whether a direct-child keyword of the declaring schema begins at `start`. */
const isChildMarkerAt = (schemaPath: string, start: number): boolean =>
  NAMED_CHILD_MARKERS.some((marker) => schemaPath.startsWith(marker, start)) ||
  ITEM_MARKERS.some(
    (marker) =>
      schemaPath.startsWith(marker, start) &&
      endsSegment(schemaPath, start + marker.length),
  );

/**
 * List every schema location that directly declares the child holding one declaration.
 * A location D owns a declaration path c when c continues D with `/properties/` or
 * `/prefixItems/`, or with `/items` or `/additionalItems` at the end or followed by `/`.
 * @param schemaPath - Authored declaration path of a child, such as `#/allOf/0/items`
 * @returns Candidate owner paths, shortest first; a fragment owns the child when its path is listed
 */
export const getFragmentOwnerPaths = (
  schemaPath: string,
): readonly string[] => {
  const owners: string[] = [];
  for (
    let start = schemaPath.indexOf('/');
    start !== -1;
    start = schemaPath.indexOf('/', start + 1)
  )
    if (isChildMarkerAt(schemaPath, start))
      owners.push(schemaPath.slice(0, start));
  return owners;
};
