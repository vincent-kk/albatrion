export interface BuildHashesOptions {
  packageRoot?: string;
  packageName?: string;
  packageVersion?: string;
  assetPathRel?: string;
}

export interface BuildHashesResult {
  outPath: string;
  fileCount: number;
}

export function buildHashes(
  opts?: BuildHashesOptions,
): Promise<BuildHashesResult>;
