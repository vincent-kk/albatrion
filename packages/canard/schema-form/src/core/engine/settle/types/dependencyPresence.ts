/** Six sets borrowed only until the next query in one presence-registration call. */
export interface DependencyPresenceWork {
  owners: Set<string>;
  stateOnly: Set<string>;
  outerTemplates: Set<string>;
  directTemplates: Set<string>;
  ancestorOwners: Set<string>;
  direct: Set<string>;
}
