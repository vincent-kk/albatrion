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
  /** `assetRoot` relative to `packageRoot`. */
  assetPath: string;
  /** Whether `dist/agents-hashes.json` exists. Meaningful only when `hashSource` is `manifest`. */
  hashesPresent: boolean;
  /**
   * Where this target's hashes come from: the stored manifest, or the asset
   * directory hashed at run time because `--asset-path` named it.
   */
  hashSource: 'manifest' | 'directory';
}
