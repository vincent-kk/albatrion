/**
 * Resolves consumer aliases and JSX props against exported declaration members.
 * @param surface - Structural public surface for one release.
 * @param identifier - Expanded identifier from a migration cell.
 * @param legacy - Whether consumer node aliases refer to the 0.16.1 types.
 * @returns Whether the exact export or member exists; unknown roots fail closed.
 */
export function hasMigrationIdentifier(
  surface: Map<string, string[]>,
  identifier: string,
  legacy: boolean,
): boolean {
  const aliases: Record<string, string> = {
    node: legacy ? 'SchemaNode' : 'FieldNode',
    handle: 'FormHandle',
    plugin: 'SchemaFormPlugin',
  };
  const [root, member, extra] = identifier.split('.');
  if (extra) return false;
  if (member)
    return surface.get(aliases[root] ?? root)?.includes(member) ?? false;
  return (
    surface.has(root) ||
    ['FormProps', 'FormProviderProps'].some((owner) =>
      surface.get(owner)?.includes(root),
    )
  );
}
