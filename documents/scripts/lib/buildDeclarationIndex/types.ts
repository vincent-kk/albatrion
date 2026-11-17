import type { EntryExport } from '../listEntryExports';
import type { ImportPath, ParsedFunction, Redirect, UndocumentedExport } from '../types';

/** The generated page of one declaration. */
export interface DeclarationPage {
  /** `filePath + '#' + declaredName` of the declaration. */
  key: string;
  /** File name and title of the page. */
  pageName: string;
  /** Category directory of the page; '' places it directly under the package directory. */
  category: string;
  /** Page content, with `name`, `categoryPath` and `importPaths` set for this page. */
  parsed: ParsedFunction;
  /** Canonical entry first, then the other sub-paths in `exports` order, then the root. */
  importPaths: ImportPath[];
}

/** Every page of a package, the exported names left without one, and the redirects to the pages. */
export interface DeclarationIndex {
  pages: DeclarationPage[];
  undocumented: UndocumentedExport[];
  /** Sorted by `from`. */
  redirects: Redirect[];
}

/** One entry point of the package, with the category its canonical pages go to. */
export interface IndexedEntry {
  entryKey: string;
  dtsPath: string;
  /** Real path of the directory that holds `dtsPath`. */
  entryDir: string;
  category: string;
  exportsOrder: number;
  /** Names whose export specifier carries the deprecation tag. */
  deprecatedNames: Set<string>;
}

/** One way a declaration is exported: the entry and what it reports for the name. */
export type ExportRef = { entry: IndexedEntry; item: EntryExport };
