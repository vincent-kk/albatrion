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

// ── sync-winglet-docs types ──────────────────────────────────────────

export interface ParamInfo {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: string;
  /** Parameter description from @param tag */
  description: string;
}

export interface ReturnInfo {
  /** Return type */
  type: string;
  /** Return description from @returns tag */
  description: string;
}

export interface TemplateInfo {
  /** Template parameter name */
  name: string;
  /** Template description from @template tag */
  description: string;
}

export interface Example {
  /** Example title (text before code block) */
  title: string;
  /** Example code (inside code block) */
  code: string;
}

export interface ParsedFunction {
  /** Symbol name, e.g. "chunk" */
  name: string;
  /** Kind of declaration */
  kind: 'function' | 'class' | 'const' | 'type' | 'interface' | 'enum';
  /** Description text before first @tag */
  description: string;
  /** Full type signature from the declaration */
  typeSignature: string;
  /** Parsed @param tags */
  params: ParamInfo[];
  /** Parsed @returns tag */
  returns: ReturnInfo | undefined;
  /** Parsed @template tags */
  templates: TemplateInfo[];
  /** Parsed @example blocks */
  examples: Example[];
  /** Parsed @remarks text */
  remarks: string | undefined;
  /** Package name, e.g. "@winglet/common-utils" */
  packageName: string;
  /** Package version, e.g. "0.10.0" */
  packageVersion: string;
  /** Category path from sub-path export, e.g. "array" */
  categoryPath: string;
  /** Absolute path to the source .d.ts file */
  sourceFile: string;
}

export interface CategoryMeta {
  /** Display label for the category */
  label: string;
  /** Sort position in sidebar */
  position: number;
  /** Whether the category is collapsed by default */
  collapsed: boolean;
  /** Unique key to avoid translation key conflicts across packages */
  key: string;
}

export interface DocSyncResult {
  /** Number of files created */
  created: number;
  /** Number of files updated */
  updated: number;
  /** Number of files unchanged */
  unchanged: number;
  /** Number of files skipped (manual) */
  skipped: number;
  /** Number of stale files removed */
  stale: number;
}
