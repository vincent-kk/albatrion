/** The file changes that bring the generated winglet pages in line with the built packages. */
export interface SyncPlan {
  /** Files to create or replace; empty when `errors` is not. */
  writes: Array<{ path: string; content: string }>;
  /** Files to remove; empty when `errors` is not. */
  deletes: string[];
  /** One line per problem that stops the sync: an unbuilt package, an exported name without a page, a page path collision. */
  errors: string[];
  /** Number of packages planned. */
  packageCount: number;
}
