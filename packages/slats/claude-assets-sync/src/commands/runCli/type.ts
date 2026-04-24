export interface RunCliOptions {
  version?: string;
  /** Absolute filesystem path to the consumer package root. */
  packageRoot: string;
  /** Consumer package name used in logs and error messages. */
  packageName: string;
  /** Consumer package version used in logs. */
  packageVersion: string;
  /** Asset directory path relative to `packageRoot`. */
  assetPath: string;
}

export interface DefaultFlags {
  scope?: string;
  dryRun?: boolean;
  force?: boolean;
  root?: string;
}

/**
 * Resolved consumer metadata passed to the injection pipeline.
 * The caller owns the definition; the library does not read `package.json`.
 */
export interface ConsumerPackage {
  name: string;
  version: string;
  packageRoot: string;
  assetRoot: string;
  hashesPresent: boolean;
}
