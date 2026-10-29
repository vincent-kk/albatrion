import {
  JSONPointer as $,
  type PointerSegment,
  appendSegment,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

/**
 * List every schema location that directly declares the child holding one declaration.
 * A location D owns a declaration path c when c continues D with `/properties/` or
 * `/prefixItems/`, or with `/items` or `/additionalItems` at the end or followed by `/`.
 * @param schemaPath - Authored declaration path of a child, such as `#/allOf/0/items`
 * @param segments - Prepared declaration syntax; cold callers may omit it
 * @returns Candidate owner paths, shortest first; a fragment owns the child when its path is listed
 */
export const getFragmentOwnerPaths = (
  schemaPath: string,
  segments: readonly PointerSegment[] = parsePointerSegments(schemaPath),
): readonly string[] => {
  const owners: string[] = [];
  let prefix: string = $.Fragment;
  for (let index = 0; index < segments.length; index++) {
    const name = segments[index];
    if (typeof name !== 'string') continue;
    if (
      name === 'items' ||
      name === 'additionalItems' ||
      ((name === 'properties' || name === 'prefixItems') &&
        index + 1 < segments.length)
    )
      owners.push(prefix);
    prefix = appendSegment(prefix, name);
  }
  return owners;
};
