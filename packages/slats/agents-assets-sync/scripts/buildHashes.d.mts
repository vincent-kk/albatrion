export interface BuildHashesOptions {
  /** Absolute path to the consumer package root. */
  packageRoot: string;
  packageName: string;
  packageVersion: string;
  /** Asset root relative to `packageRoot`. */
  assetPath: string;
}

export interface BuildHashesResult {
  outPath: string;
  fileCount: number;
}

export function buildHashes(
  opts: BuildHashesOptions,
): Promise<BuildHashesResult>;
