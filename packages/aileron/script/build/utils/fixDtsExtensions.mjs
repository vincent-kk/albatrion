/**
 * Adds runtime extensions to relative module specifiers in declaration files.
 *
 * TypeScript's `tsc` emits .d.ts files with extensionless relative imports
 * (e.g., `export * from './clamp'`). This breaks `moduleResolution: "node16"`
 * and `"nodenext"` which require explicit file extensions in ESM.
 *
 * TypeScript syntax selects imports/exports and import types, leaving comments
 * and string literal types intact. Verified .d.ts targets receive .js and
 * .d.mts targets receive .mjs, including directory indexes.
 *
 * Usage:
 *   import { fixDtsExtensions } from './utils/fixDtsExtensions.mjs';
 *   fixDtsExtensions('dist');
 *
 * Or CLI:
 *   node packages/aileron/script/build/utils/fixDtsExtensions.mjs <dir>
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import ts from 'typescript';

/**
 * Recognizes relative paths, including current and parent directory indexes.
 */
const RELATIVE_PATH_RE = /^\.\.?(?:\/|$)/;

/**
 * Check if a path already has a known file extension.
 */
function hasExtension(importPath) {
  return /\.\w+$/.test(importPath) && /\.(js|mjs|cjs|json|ts|mts|cts|jsx|tsx)$/.test(importPath);
}

/**
 * @param {string} dir - Directory containing .d.ts files to process
 * @returns {{ filesProcessed: number, importsFixed: number }}
 */
export function fixDtsExtensions(dir) {
  let filesProcessed = 0;
  let importsFixed = 0;

  function walk(currentDir) {
    let entries;
    try {
      entries = readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.d.ts') || entry.name.endsWith('.d.mts')) {
        const content = readFileSync(fullPath, 'utf-8');
        const source = ts.createSourceFile(fullPath, content, ts.ScriptTarget.Latest);
        const specifiers = [];
        /** Visit only module-bearing syntax; string contents are never reparsed. */
        const visit = (node) => {
          const specifier = ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)
            ? node.argument.literal
            : ts.isImportDeclaration(node) || ts.isExportDeclaration(node) ? node.moduleSpecifier : undefined;
          if (specifier && ts.isStringLiteral(specifier)) specifiers.push(specifier);
          ts.forEachChild(node, visit);
        };
        visit(source);
        let fixCount = 0;
        let fixed = content;
        // Descending insertions preserve the original syntax positions and quote escapes.
        for (const specifier of specifiers.sort((left, right) => right.end - left.end)) {
          const importPath = specifier.text;
          if (!RELATIVE_PATH_RE.test(importPath) || hasExtension(importPath)) continue;
          const base = join(dirname(fullPath), importPath);
          const trailingSlash = importPath.endsWith('/');
          let suffix;
          if (!trailingSlash && existsSync(base + '.d.ts')) suffix = '.js';
          else if (!trailingSlash && existsSync(base + '.d.mts')) suffix = '.mjs';
          else if (existsSync(join(base, 'index.d.ts'))) suffix = `${trailingSlash ? '' : '/'}index.js`;
          else if (existsSync(join(base, 'index.d.mts'))) suffix = `${trailingSlash ? '' : '/'}index.mjs`;
          if (!suffix) continue;
          const position = specifier.end - 1;
          fixed = fixed.slice(0, position) + suffix + fixed.slice(position);
          fixCount++;
        }

        if (fixCount > 0) {
          writeFileSync(fullPath, fixed, 'utf-8');
          filesProcessed++;
          importsFixed += fixCount;
        }
      }
    }
  }

  walk(dir);
  return { filesProcessed, importsFixed };
}

// CLI usage: node fixDtsExtensions.mjs <dir>
const isCLI =
  process.argv[1] &&
  (import.meta.url === `file://${process.argv[1]}` ||
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/')));

if (isCLI) {
  const dir = process.argv[2] || 'dist';
  const { filesProcessed, importsFixed } = fixDtsExtensions(dir);
  if (filesProcessed > 0) {
    console.log(`Fixed ${importsFixed} imports in ${filesProcessed} .d.ts files.`);
  }
}
