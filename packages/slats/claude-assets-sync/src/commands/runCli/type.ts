export interface RunCliOptions {
  version?: string;
  /**
   * When set, the package that owns this file becomes the implicit
   * `--package` target. Consumer bin stubs pass `import.meta.url`; slats's
   * own top-level bin omits it so `discover()` returns every consumer.
   */
  invokedFromBin?: string;
}

export interface DefaultFlags {
  package?: string;
  all?: boolean;
  scope?: string;
  dryRun?: boolean;
  force?: boolean;
  root?: string;
  workspaces?: boolean;
}
