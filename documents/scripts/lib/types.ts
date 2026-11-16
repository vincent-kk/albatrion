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

/** One line of a page's `## Import` section: a name one entry point exports. */
export interface ImportPath {
  /** Key of the entry in the package `exports` map, "." for the root. */
  entryKey: string;
  /** Specifier a consumer imports from, e.g. "@winglet/json/pointer". */
  moduleSpecifier: string;
  /** Name the entry point exports. */
  exportedName: string;
  /** Whether the entry exports the name for type positions only, so it is imported with `import type`. */
  typeOnly: boolean;
}

/** Where a declaration that a package re-exports from another module comes from. */
export interface ExternalSource {
  /** Module the package re-exports from, e.g. "react". */
  moduleSpecifier: string;
  /** Name of the declaration in that module, e.g. "isValidElement". */
  originalName: string;
}

/** An exported name that no generated page documents. */
export interface UndocumentedExport {
  /** Key of the entry in the package `exports` map, "." for the root. */
  entryKey: string;
  /** Name the entry point exports. */
  exportedName: string;
  /** Absolute path of the file that holds the declaration or the re-export. */
  filePath: string;
}

/** One client-side redirect, as `@docusaurus/plugin-client-redirects` reads it. */
export interface Redirect {
  /** Site path without the base URL that no page serves, e.g. "/docs/winglet/json/pointer/getValue". */
  from: string;
  /** Site path of the canonical page. */
  to: string;
}

export interface ParsedFunction {
  /** Symbol name, e.g. "chunk"; on a generated page, the page name */
  name: string;
  /** Kind of declaration; a re-export of a declaration from another module is `re-export` */
  kind: 'function' | 'class' | 'const' | 'type' | 'interface' | 'enum' | 're-export';
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
  /** Whether the JSDoc carries the deprecation tag (literal omitted so TypeScript does not deprecate this field) */
  deprecated: boolean;
  /** Package name, e.g. "@winglet/common-utils" */
  packageName: string;
  /** Package version, e.g. "0.10.0" */
  packageVersion: string;
  /** Category directory of the page, e.g. "array"; empty for a page directly under the package directory */
  categoryPath: string;
  /** Absolute path to the source .d.ts file */
  sourceFile: string;
  /** Every way to import the declaration, canonical entry first; empty until the declaration index fills it */
  importPaths: ImportPath[];
  /** Source module of a re-exported declaration from outside the package; null for a declaration in the package */
  externalSource: ExternalSource | null;
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
