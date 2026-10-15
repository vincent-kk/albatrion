/** Path segments through which a fragment contributes a declaration to a child. */
const OWNER_MARKERS = ['/properties/', '/items/', '/prefixItems/'] as const;

/** Declaration fields read by the ownership test. */
export interface FragmentMember {
  /** Authored declaration ID used to filter by selection. */
  readonly id: number;
  /** Authored schema address of the declaration. */
  readonly schemaPath: string;
}

/**
 * Collect the schema paths of every fragment that owns one of the declarations.
 * A fragment D owns a declaration c when c's path continues D's path with an
 * owner marker, so a fragment owns the target exactly when its path is in the set.
 * @param declarations - Static declarations of one child target
 * @param selectedIds - Declaration IDs to consider; every declaration when omitted
 * @returns Every prefix that a considered path continues with an owner marker
 */
export const collectFragmentOwnerPaths = (
  declarations: readonly FragmentMember[],
  selectedIds?: readonly number[],
): ReadonlySet<string> => {
  const owners = new Set<string>();
  for (const { id, schemaPath } of declarations) {
    if (selectedIds && !selectedIds.includes(id)) continue;
    for (const marker of OWNER_MARKERS)
      for (
        let at = schemaPath.indexOf(marker);
        at !== -1;
        at = schemaPath.indexOf(marker, at + 1)
      )
        owners.add(schemaPath.slice(0, at));
  }
  return owners;
};
