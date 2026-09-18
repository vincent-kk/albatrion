import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

/** Mapping of symbol name to absolute .d.ts file path. */
export interface SymbolFileMap {
  [symbolName: string]: string;
}

/**
 * Resolve a barrel index.d.ts file to a map of symbol names to their individual .d.ts file paths.
 * Handles named re-exports, wildcard re-exports, and nested barrels.
 */
export function resolveSymbolFiles(barrelPath: string): SymbolFileMap {
  const result: SymbolFileMap = {};
  resolveBarrel(barrelPath, result, new Set());
  return result;
}

/** Recursively resolve barrel exports, parsed as a syntax tree so multi-line export blocks (emitted when a specifier carries JSDoc) resolve too. */
function resolveBarrel(
  barrelPath: string,
  result: SymbolFileMap,
  visited: Set<string>,
): void {
  const resolved = path.resolve(barrelPath);
  if (visited.has(resolved)) return;
  visited.add(resolved);

  if (!fs.existsSync(resolved)) return;

  const content = fs.readFileSync(resolved, 'utf-8');
  const sourceFile = ts.createSourceFile(
    resolved,
    content,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  const barrelDir = path.dirname(resolved);

  for (const statement of sourceFile.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    )
      continue;
    const targetPath = resolveRelativeDts(
      barrelDir,
      statement.moduleSpecifier.text,
    );
    if (!targetPath) continue;

    // export { a, type B, c as D } from './file'; (also `export type { ... }`)
    if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const specifier of statement.exportClause.elements) {
        result[specifier.name.text] = targetPath;
      }
      continue;
    }

    // export * from './file'; / export type * from './file';
    if (!statement.exportClause) {
      if (isBarrelFile(targetPath)) {
        resolveBarrel(targetPath, result, visited);
      } else {
        extractDirectExportNames(targetPath, result);
      }
    }
  }
}

/**
 * Resolve a relative import path to an absolute .d.ts file path.
 * Tries: NodeNext .js/.mjs/.cjs → .d.ts mapping, exact path, path + .d.ts,
 * path/index.d.ts
 */
function resolveRelativeDts(
  baseDir: string,
  relativePath: string,
): string | null {
  const exact = path.resolve(baseDir, relativePath);

  // NodeNext-style declaration barrels re-export the emitted JS path
  // (e.g. `from './useConstant.js'` written by tsc-alias) — map the JS
  // suffix back to its declaration counterpart before other fallbacks.
  const stripped = exact.replace(/\.(?:m|c)?js$/, '');
  if (stripped !== exact) {
    const strippedDts = stripped + '.d.ts';
    if (fs.existsSync(strippedDts)) return strippedDts;
    const strippedIndexDts = path.join(stripped, 'index.d.ts');
    if (fs.existsSync(strippedIndexDts)) return strippedIndexDts;
  }

  // Try exact path
  if (fs.existsSync(exact) && fs.statSync(exact).isFile()) return exact;

  // Try with .d.ts extension
  const withDts = exact + '.d.ts';
  if (fs.existsSync(withDts)) return withDts;

  // Try as directory with index.d.ts
  const indexDts = path.join(exact, 'index.d.ts');
  if (fs.existsSync(indexDts)) return indexDts;

  return null;
}

/** Check if a .d.ts file is a barrel (index.d.ts with only re-exports). */
function isBarrelFile(filePath: string): boolean {
  return path.basename(filePath) === 'index.d.ts';
}

/** Extract exported symbol names from a leaf .d.ts file and add to result map. */
function extractDirectExportNames(
  filePath: string,
  result: SymbolFileMap,
): void {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // export declare function name
    const funcMatch = trimmed.match(/^export\s+declare\s+function\s+(\w+)/);
    if (funcMatch) {
      result[funcMatch[1]] = filePath;
      continue;
    }

    // export declare const name
    const constMatch = trimmed.match(/^export\s+declare\s+const\s+(\w+)/);
    if (constMatch) {
      result[constMatch[1]] = filePath;
      continue;
    }

    // export declare class name
    const classMatch = trimmed.match(/^export\s+declare\s+class\s+(\w+)/);
    if (classMatch) {
      result[classMatch[1]] = filePath;
      continue;
    }

    // export declare type name / export type name
    const typeMatch = trimmed.match(
      /^export\s+(?:declare\s+)?type\s+(\w+)\s*[<=]/,
    );
    if (typeMatch) {
      result[typeMatch[1]] = filePath;
      continue;
    }

    // export interface name / export declare interface name
    const ifaceMatch = trimmed.match(
      /^export\s+(?:declare\s+)?interface\s+(\w+)/,
    );
    if (ifaceMatch) {
      result[ifaceMatch[1]] = filePath;
      continue;
    }

    // export declare enum name
    const enumMatch = trimmed.match(/^export\s+declare\s+enum\s+(\w+)/);
    if (enumMatch) {
      result[enumMatch[1]] = filePath;
      continue;
    }
  }
}
