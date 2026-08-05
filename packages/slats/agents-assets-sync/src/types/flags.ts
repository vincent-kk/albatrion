/** Parsed CLI flags, as commander hands them to the action. */
export interface DefaultFlags {
  /** Target package(s): scope alias, scoped name, or unscoped name. */
  package?: string[];
  /** Target agent(s): `claude` | `codex`. Empty means "ask, or refuse". */
  agent?: string[];
  scope?: string;
  /** Asset kind filter: `skills` | `rules` | `commands`. Empty means all. */
  asset?: string[];
  dryRun?: boolean;
  force?: boolean;
  /** Auto-approve every confirmation the run would otherwise stop on. */
  yes?: boolean;
  /**
   * Commander's `--no-interactive` convention: an absent flag leaves this
   * `true`. When `false`, no prompt is shown and a missing flag exits 2.
   */
  interactive?: boolean;
  root?: string;
  json?: boolean;
}
