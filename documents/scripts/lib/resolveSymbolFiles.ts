import * as fs from 'node:fs';
import * as path from 'node:path';

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

/** Recursively resolve barrel exports. */
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
  const lines = content.split('\n');
  const barrelDir = path.dirname(resolved);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    // Pattern 1: export { name1, name2 } from './file';
    // Also handles: export { type Name, Name2 } from './file';
    const namedMatch = trimmed.match(
      /^export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/
    );
    if (namedMatch) {
      const names = namedMatch[1].split(',').map(s => s.trim());
      const fromPath = namedMatch[2];
      const targetPath = resolveRelativeDts(barrelDir, fromPath);

      for (const raw of names) {
        if (!raw) continue;
        // Strip "type " prefix
        const cleaned = raw.replace(/^type\s+/, '');
        // Handle "Name as Alias"
        const asMatch = cleaned.match(/^(\w+)\s+as\s+(\w+)$/);
        const name = asMatch ? asMatch[2] : cleaned.trim();
        if (name && targetPath) {
          result[name] = targetPath;
        }
      }
      continue;
    }

    // Pattern 2: export type { Name1, Name2 } from './file';
    const typeReExportMatch = trimmed.match(
      /^export\s+type\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/
    );
    if (typeReExportMatch) {
      const names = typeReExportMatch[1].split(',').map(s => s.trim());
      const fromPath = typeReExportMatch[2];
      const targetPath = resolveRelativeDts(barrelDir, fromPath);

      for (const raw of names) {
        if (!raw) continue;
        const asMatch = raw.match(/^(\w+)\s+as\s+(\w+)$/);
        const name = asMatch ? asMatch[2] : raw.trim();
        if (name && targetPath) {
          result[name] = targetPath;
        }
      }
      continue;
    }

    // Pattern 3: export * from './file'; (wildcard re-export)
    const wildcardMatch = trimmed.match(
      /^export\s+\*\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/
    );
    if (wildcardMatch) {
      const fromPath = wildcardMatch[1];
      const targetPath = resolveRelativeDts(barrelDir, fromPath);
      if (targetPath) {
        // Check if target is itself a barrel (index.d.ts) or a leaf file
        if (isBarrelFile(targetPath)) {
          resolveBarrel(targetPath, result, visited);
        } else {
          // Extract symbol names from the target file directly
          extractDirectExportNames(targetPath, result);
        }
      }
      continue;
    }

    // Pattern 4: export type * from './file'; (type-only wildcard)
    const typeWildcardMatch = trimmed.match(
      /^export\s+type\s+\*\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/
    );
    if (typeWildcardMatch) {
      const fromPath = typeWildcardMatch[1];
      const targetPath = resolveRelativeDts(barrelDir, fromPath);
      if (targetPath) {
        if (isBarrelFile(targetPath)) {
          resolveBarrel(targetPath, result, visited);
        } else {
          extractDirectExportNames(targetPath, result);
        }
      }
      continue;
    }
  }
}

/**
 * Resolve a relative import path to an absolute .d.ts file path.
 * Tries: exact path, path + .d.ts, path/index.d.ts
 */
function resolveRelativeDts(baseDir: string, relativePath: string): string | null {
  // Try exact path
  const exact = path.resolve(baseDir, relativePath);
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
function extractDirectExportNames(filePath: string, result: SymbolFileMap): void {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // export declare function name
    const funcMatch = trimmed.match(/^export\s+declare\s+function\s+(\w+)/);
    if (funcMatch) { result[funcMatch[1]] = filePath; continue; }

    // export declare const name
    const constMatch = trimmed.match(/^export\s+declare\s+const\s+(\w+)/);
    if (constMatch) { result[constMatch[1]] = filePath; continue; }

    // export declare class name
    const classMatch = trimmed.match(/^export\s+declare\s+class\s+(\w+)/);
    if (classMatch) { result[classMatch[1]] = filePath; continue; }

    // export declare type name / export type name
    const typeMatch = trimmed.match(/^export\s+(?:declare\s+)?type\s+(\w+)\s*[<=]/);
    if (typeMatch) { result[typeMatch[1]] = filePath; continue; }

    // export interface name / export declare interface name
    const ifaceMatch = trimmed.match(/^export\s+(?:declare\s+)?interface\s+(\w+)/);
    if (ifaceMatch) { result[ifaceMatch[1]] = filePath; continue; }

    // export declare enum name
    const enumMatch = trimmed.match(/^export\s+declare\s+enum\s+(\w+)/);
    if (enumMatch) { result[enumMatch[1]] = filePath; continue; }
  }
}
