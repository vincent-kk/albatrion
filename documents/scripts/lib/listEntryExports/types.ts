/** One name an entry declaration file exports, traced to the declaration it names. */
export interface EntryExport {
  /** Name the entry point exports. */
  exportedName: string;
  /** Name written on the declaration; for an external re-export, the name in the source module. */
  declaredName: string;
  /** Absolute path of the .d.ts that holds the declaration; for an external re-export, `reexportSite`. */
  filePath: string;
  /** File boundaries crossed from the entry file to `filePath`: 0 inside the entry file, otherwise 1 or more, each `export *` step counted. */
  hops: number;
  /** True when the resolved symbol has no value meaning, or any step of the path is an `export type`, `import type` or `type` specifier. */
  isTypeOnly: boolean;
  /** Module specifier of the re-export when the declaration lies outside the package or its module cannot be resolved; otherwise null. */
  externalSpecifier: string | null;
  /** For an external re-export, absolute path of the last file inside the package on the re-export path; otherwise null. */
  reexportSite: string | null;
}

/** One `export *` statement crossed while following an export to its declaration. */
export interface StarEdge {
  fromFile: string;
  toFile: string;
  specifier: string;
  isTypeOnly: boolean;
}
