export interface DefaultFlags {
  scope?: string;
  dryRun?: boolean;
  force?: boolean;
  root?: string;
  package?: string[];
  json?: boolean;
}

/**
 * Resolved consumer metadata passed to the injection pipeline.
 * The dispatcher bin populates this by resolving a single explicitly-named
 * target package — `core/**` still never reads `package.json` itself.
 */
export interface ConsumerPackage {
  name: string;
  version: string;
  packageRoot: string;
  assetRoot: string;
  hashesPresent: boolean;
}
