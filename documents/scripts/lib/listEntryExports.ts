import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

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
interface StarEdge {
  fromFile: string;
  toFile: string;
  specifier: string;
  isTypeOnly: boolean;
}

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

/**
 * Follows one exported symbol through aliases and `export *` statements,
 * counting file boundaries, until it reaches a declaration or leaves the package.
 */
function traceExport(
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

/**
 * Shortest chain of `export *` statements leading from `fromFile` to
 * `targetFile`, or null when none does. A target module that cannot be
 * resolved contributes no names, so it is never part of a chain.
 */
function traceStarPath(checker: ts.TypeChecker, fromFile: ts.SourceFile, targetFile: ts.SourceFile): StarEdge[] | null {
  const queue: Array<{ file: ts.SourceFile; edges: StarEdge[] }> = [{ file: fromFile, edges: [] }];
  const visited = new Set<ts.SourceFile>([fromFile]);
  for (let index = 0; index < queue.length; index++) {
    const { file, edges } = queue[index];
    for (const statement of file.statements) {
      if (!ts.isExportDeclaration(statement) || statement.exportClause) continue;
      const specifier = statement.moduleSpecifier;
      if (!specifier || !ts.isStringLiteral(specifier)) continue;
      const target = resolveModuleFile(checker, specifier);
      if (!target || visited.has(target)) continue;
      const path = [
        ...edges,
        { fromFile: file.fileName, toFile: target.fileName, specifier: specifier.text, isTypeOnly: statement.isTypeOnly },
      ];
      if (target === targetFile) return path;
      visited.add(target);
      queue.push({ file: target, edges: path });
    }
  }
  return null;
}

/** The string-literal module specifier of the import or export statement that holds an alias declaration, if any. */
function moduleSpecifierOf(declaration: ts.Declaration): ts.StringLiteral | undefined {
  const statement = ts.findAncestor(
    declaration,
    (node): node is ts.ImportDeclaration | ts.ExportDeclaration =>
      ts.isImportDeclaration(node) || ts.isExportDeclaration(node),
  );
  const specifier = statement?.moduleSpecifier;
  return specifier && ts.isStringLiteral(specifier) ? specifier : undefined;
}

/** The source file a module specifier resolves to; undefined when it does not resolve to a file. */
function resolveModuleFile(checker: ts.TypeChecker, specifier: ts.StringLiteral): ts.SourceFile | undefined {
  return checker.getSymbolAtLocation(specifier)?.declarations?.find(ts.isSourceFile);
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
