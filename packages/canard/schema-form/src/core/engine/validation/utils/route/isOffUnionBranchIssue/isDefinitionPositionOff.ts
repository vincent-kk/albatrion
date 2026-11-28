import type { SchemaFragment } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { collectOffBranches } from './collectOffBranches';
import { reachesFragment } from './reachesFragment';

/**
 * Decide whether a definition position is reached only through an unselected branch. The
 * position's fragment is the one bound at the host whose authored location equals it. When
 * that fragment is committed at the host, a selected route reaches it and the position is
 * not off. Otherwise the position is off when an off branch hosted at the host or one of its
 * ancestors reaches the fragment by child links along the instance path down to the host.
 * @param location - Canonical definition position as written from `#`.
 * @param host - Occurrence the position applies to.
 * @param fragments - The blueprint's fragment table, indexed by fragment id.
 * @param isActive - Committed branch evidence for a fragment at a given host occurrence.
 * @returns True only for a uniquely bound, uncommitted definition reached from an off branch.
 */
export const isDefinitionPositionOff = <Self extends FieldNodeRecord<Self>>(
  location: string,
  host: Self,
  fragments: readonly SchemaFragment[],
  isActive: (fragment: SchemaFragment, host: Self) => boolean,
): boolean => {
  const definition = findBoundFragment(host, fragments, location);
  if (!definition || isActive(definition, host)) return false;
  const tokens: string[] = [];
  for (
    let ancestor: Self | null = host;
    ancestor;
    ancestor = ancestor.__parent__
  ) {
    for (const branch of collectOffBranches(ancestor, fragments, isActive))
      if (reachesFragment(branch, tokens, definition, fragments)) return true;
    tokens.unshift(ancestor.name);
  }
  return false;
};

/**
 * Find the one fragment bound at an occurrence whose authored location is the given one.
 * @param host - Occurrence whose blueprint node declarations name the fragments bound there.
 * @param fragments - The blueprint's fragment table, indexed by fragment id.
 * @param location - Canonical authored location.
 * @returns The fragment, or null when none or several distinct fragments have that location.
 */
const findBoundFragment = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  fragments: readonly SchemaFragment[],
  location: string,
): SchemaFragment | null => {
  let found: SchemaFragment | null = null;
  for (const declaration of host.blueprintNode.declarations) {
    const fragment = fragments[declaration.fragmentId];
    if (fragment.schemaPath !== location || fragment === found) continue;
    if (found) return null;
    found = fragment;
  }
  return found;
};
