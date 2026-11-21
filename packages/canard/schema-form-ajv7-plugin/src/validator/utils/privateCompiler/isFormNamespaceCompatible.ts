import type {
  ApplicationGraph,
  PrivateCompiler,
  SchemaDependencies,
} from './types';

/**
 * Keep form reservations disjoint from other registrations and imported resource namespaces.
 * @param compiler - Current environment whose native aliases may outlive explicit release.
 * @param facts - New detached form declarations, already normalized by the native resolver.
 * @param graph - Current imported graph, absent for a root without references.
 * @param owner - Registration allowed to reuse its own previously reserved form addresses.
 * @returns Whether native registrations can coexist without observing stale code or aliases.
 */
export const isFormNamespaceCompatible = (
  compiler: PrivateCompiler,
  facts: SchemaDependencies,
  graph: ApplicationGraph | undefined,
  owner: string,
): boolean => {
  for (const { address } of facts.resources) {
    if (compiler.claims.has(address)) return false;
    const reserved = compiler.formOwners?.get(address);
    if (reserved !== undefined && reserved !== owner) return false;
  }
  if (graph && compiler.formOwners)
    for (const address of graph.claims.keys())
      if (compiler.formOwners.has(address)) return false;
  return true;
};
