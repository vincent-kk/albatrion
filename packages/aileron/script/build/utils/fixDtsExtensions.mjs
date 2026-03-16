/**
 * Adds .js extensions to relative import paths in .d.ts files.
 *
 * TypeScript's `tsc` emits .d.ts files with extensionless relative imports
 * (e.g., `export * from './clamp'`). This breaks `moduleResolution: "node16"`
 * and `"nodenext"` which require explicit file extensions in ESM.
 *
 * This script rewrites them to use .js extensions
 * (e.g., `export * from './clamp.js'`), which TypeScript maps to .d.ts files.
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

/**
 * Matches relative import/export paths without file extensions.
 * Captures: from './foo' | from '../bar/baz' | from './foo/index'
 * Excludes: paths that already have extensions (.js, .mjs, .cjs, .json, etc.)
 */
const RELATIVE_IMPORT_RE =
  /(from\s+['"])(\.\.?\/[^'"]*?)(?<!\.\w+)(['"])/g;

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
        let fixCount = 0;

        const fixed = content.replace(RELATIVE_IMPORT_RE, (match, prefix, importPath, suffix) => {
          if (hasExtension(importPath)) return match;

          const base = join(dirname(fullPath), importPath);

          // Case 1: File import — ./clamp → ./clamp.js
          if (existsSync(base + '.d.ts') || existsSync(base + '.d.mts')) {
            fixCount++;
            return `${prefix}${importPath}.js${suffix}`;
          }

          // Case 2: Directory import — ./declare → ./declare/index.js
          if (existsSync(join(base, 'index.d.ts'))) {
            fixCount++;
            return `${prefix}${importPath}/index.js${suffix}`;
          }

          return match; // Don't rewrite if we can't verify
        });

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
