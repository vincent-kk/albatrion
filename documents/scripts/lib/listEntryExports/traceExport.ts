import * as path from 'node:path';
import * as ts from 'typescript';

import { moduleSpecifierOf } from './moduleSpecifierOf';
import { resolveModuleFile } from './resolveModuleFile';
import { traceStarPath } from './traceStarPath';
import type { EntryExport } from './types';

/**
 * Follows one exported symbol through aliases and `export *` statements,
 * counting file boundaries, until it reaches a declaration or leaves the package.
 */
export function traceExport(
  checker: ts.TypeChecker,
  exportSymbol: ts.Symbol,
  entryFile: ts.SourceFile,
  packageRoot: string,
): EntryExport {
  const exportedName = exportSymbol.name;
  const external = (declaredName: string, site: string, specifier: string, isTypeOnly: boolean): EntryExport => ({
    exportedName,
    declaredName,
    filePath: path.resolve(site),
    hops,
    isTypeOnly,
    externalSpecifier: specifier,
    reexportSite: path.resolve(site),
  });
  let symbol = exportSymbol;
  let currentFile = entryFile;
  let hops = 0;
  let typeOnlyPath = false;
  for (;;) {
    const declaration = symbol.declarations?.[0];
    if (!declaration) throw new Error(`export ${exportedName} of ${entryFile.fileName} has no declaration`);
    const declarationFile = declaration.getSourceFile();
    if (declarationFile !== currentFile) {
      const edges = traceStarPath(checker, currentFile, declarationFile);
      if (!edges) throw new Error(`cannot trace ${exportedName} from ${currentFile.fileName} to ${declarationFile.fileName}`);
      const exit = edges.findIndex(edge => isOutside(edge.toFile, packageRoot));
      const crossed = exit === -1 ? edges : edges.slice(0, exit + 1);
      typeOnlyPath ||= crossed.some(edge => edge.isTypeOnly);
      if (exit !== -1) {
        hops += exit;
        const isTypeOnly = typeOnlyPath || !(symbol.flags & ts.SymbolFlags.Value);
        return external(symbol.name, edges[exit].fromFile, edges[exit].specifier, isTypeOnly);
      }
      hops += edges.length;
      currentFile = declarationFile;
    }
    if (!(symbol.flags & ts.SymbolFlags.Alias)) break;
    typeOnlyPath ||= ts.isTypeOnlyImportOrExportDeclaration(declaration);
    const specifier = moduleSpecifierOf(declaration);
    if (specifier) {
      const targetFile = resolveModuleFile(checker, specifier);
      if (!targetFile || isOutside(targetFile.fileName, packageRoot)) {
        const isTypeOnly = typeOnlyPath || !(checker.getAliasedSymbol(symbol).flags & ts.SymbolFlags.Value);
        return external(aliasTargetName(declaration, symbol), currentFile.fileName, specifier.text, isTypeOnly);
      }
      if (targetFile !== currentFile) hops += 1;
      currentFile = targetFile;
    }
    const next = checker.getImmediateAliasedSymbol(symbol);
    if (!next) throw new Error(`cannot resolve alias ${symbol.name} in ${currentFile.fileName}`);
    symbol = next;
  }
  return {
    exportedName,
    declaredName: symbol.name,
    filePath: path.resolve(currentFile.fileName),
    hops,
    isTypeOnly: typeOnlyPath || !(symbol.flags & ts.SymbolFlags.Value),
    externalSpecifier: null,
    reexportSite: null,
  };
}

/** Whether `fileName` lies outside `root`, judged per path segment. */
function isOutside(fileName: string, root: string): boolean {
  const relative = path.relative(root, path.resolve(fileName));
  return relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);
}

/** The name an import or export specifier takes from its source module (`a` in `a as b`); other aliases keep their own name. */
function aliasTargetName(declaration: ts.Declaration, symbol: ts.Symbol): string {
  if (ts.isExportSpecifier(declaration) || ts.isImportSpecifier(declaration)) {
    return (declaration.propertyName ?? declaration.name).text;
  }
  return symbol.name;
}
