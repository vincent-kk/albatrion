export interface SubPathEntry {
  /** Export key from package.json exports map, e.g. "./hook", "./filter" */
  exportKey: string;
  /** Absolute path to the .d.ts file */
  dtsPath: string;
}

export interface PackageEntry {
  /** Package name, e.g. "@winglet/common-utils" */
  name: string;
  /** Package version */
  version: string;
  /** Namespace, e.g. "winglet", "canard" */
  namespace: string;
  /** Short name without namespace, e.g. "common-utils" */
  shortName: string;
  /** Absolute path to the main .d.ts barrel file */
  mainDtsPath: string;
  /** Absolute path to the MDX doc file */
  mdxPath: string;
  /** Sub-path exports with their .d.ts paths */
  subPaths: SubPathEntry[];
}

export interface ExportedSymbol {
  /** Symbol name, e.g. "chunk", "DataLoader" */
  name: string;
  /** Kind of export: function, class, const, type, interface, enum, re-export */
  kind: string;
  /** Type signature if available */
  signature?: string;
  /** First line of JSDoc comment if available */
  jsdoc?: string;
}

export interface SubPathExports {
  /** Export key, e.g. "./hook", "." for root */
  exportKey: string;
  /** Extracted symbols */
  symbols: ExportedSymbol[];
}

export interface SyncResult {
  /** Package name */
  package: string;
  /** Sync status */
  status: 'updated' | 'unchanged' | 'skipped' | 'error';
  /** Human-readable message */
  message: string;
}
