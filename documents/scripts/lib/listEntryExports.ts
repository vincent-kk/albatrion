import * as fs from 'node:fs';
import * as ts from 'typescript';

import { traceExport } from './listEntryExports/traceExport';
import type { EntryExport } from './listEntryExports/types';

export type { EntryExport };

const COMPILER_OPTIONS: ts.CompilerOptions = {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  skipLibCheck: true,
  types: [],
};

/**
 * Lists every name an entry declaration file exports, as the TypeScript
 * checker sees them, and follows each one to its declaration. Declarations
 * inside the entry file, specifier-less re-exports, nested re-exports,
 * `export *` chains and aliases all resolve through the same path.
 *
 * @param entryDtsPath - Path of the entry .d.ts file; it must exist.
 * @param packageRoot - Directory of the package; a declaration outside it is reported as external.
 * @returns One item per exported name, in the checker's export order.
 * @throws Error when the entry file cannot be loaded, or when an alias or an
 *   `export *` path to a declaration cannot be traced.
 */
export function listEntryExports(entryDtsPath: string, packageRoot: string): EntryExport[] {
  const entryPath = fs.realpathSync(entryDtsPath);
  const program = ts.createProgram([entryPath], COMPILER_OPTIONS);
  const checker = program.getTypeChecker();
  const entryFile = program.getSourceFile(entryPath);
  if (!entryFile) throw new Error(`cannot load entry declaration file: ${entryPath}`);
  const moduleSymbol = checker.getSymbolAtLocation(entryFile);
  if (!moduleSymbol) return [];
  const root = fs.realpathSync(packageRoot);
  return checker.getExportsOfModule(moduleSymbol).map(symbol => traceExport(checker, symbol, entryFile, root));
}
