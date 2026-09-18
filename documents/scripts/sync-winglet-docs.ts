#!/usr/bin/env tsx
/**
 * sync-winglet-docs — Auto-generate per-function MDX documentation pages
 * from .d.ts files for @winglet packages.
 *
 * Reads JSDoc comments preserved in .d.ts files and generates individual
 * MDX pages (es-toolkit.dev style) with rich documentation including
 * signature, parameters, examples, and interactive playground.
 *
 * Only auto-generated pages (with <!-- sync-winglet-docs:auto --> marker)
 * are updated. Manual pages are never modified.
 *
 * Usage:
 *   tsx scripts/sync-winglet-docs.ts                # Generate/update MDX pages
 *   tsx scripts/sync-winglet-docs.ts --check        # Validate only (exit 1 if stale)
 *   tsx scripts/sync-winglet-docs.ts --package common-utils  # Process single package
 */
import * as path from 'node:path';
import { discoverPackages } from './lib/packageRegistry';
import { resolveSymbolFiles } from './lib/resolveSymbolFiles';
import { parseRichJSDoc } from './lib/parseRichJSDoc';
import { collectDeprecatedExports } from './lib/collectDeprecatedExports';
import { generateMdx, generateCategoryMeta, serializeCategoryJSON } from './lib/mdxGenerator';
import {
  ensureDir,
  writeDocFile,
  writeCategoryJSON,
  cleanupStaleFiles,
  createSyncResult,
} from './lib/manageDocs';
import type { DocSyncResult, PackageEntry } from './lib/types';

const MONOREPO_ROOT = path.resolve(__dirname, '..', '..');
const WINGLET_DOCS_DIR = path.join(MONOREPO_ROOT, 'documents', 'docs', 'winglet');

const isCheckMode = process.argv.includes('--check');
const packageFilter = getPackageFilter();

function getPackageFilter(): string | null {
  const idx = process.argv.indexOf('--package');
  if (idx === -1 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

/** Normalize export key to category path (e.g., "./array" -> "array"). */
function exportKeyToCategory(exportKey: string): string {
  return exportKey.replace(/^\.\//, '').replace(/^\./, '');
}

/**
 * Collects the lower-cased MDX path of every non-deprecated symbol across a
 * package's entries, so a deprecated alias can be skipped only when it
 * collides with one of these on a case-insensitive filesystem.
 */
function computeCanonicalPathsLower(
  entries: Array<{ dtsPath: string; category: string }>,
  pkgDocsDir: string,
  pkg: PackageEntry,
): Set<string> {
  const canonicalPathsLower = new Set<string>();
  for (const entry of entries) {
    const categoryDir = entry.category ? path.join(pkgDocsDir, entry.category) : pkgDocsDir;
    const symbolMap = resolveSymbolFiles(entry.dtsPath);
    const deprecatedExports = collectDeprecatedExports(entry.dtsPath);
    const fileSymbolNames = new Map<string, string[]>();
    for (const [symbolName, filePath] of Object.entries(symbolMap)) {
      const existing = fileSymbolNames.get(filePath);
      if (existing) existing.push(symbolName);
      else fileSymbolNames.set(filePath, [symbolName]);
    }
    for (const [filePath] of fileSymbolNames) {
      const parsed = parseRichJSDoc(filePath, pkg.name, pkg.version, entry.category || 'root');
      for (const fn of parsed) {
        if (!symbolMap[fn.name] || fn.deprecated || deprecatedExports.has(fn.name)) continue;
        canonicalPathsLower.add(path.join(categoryDir, `${fn.name}.mdx`).toLowerCase());
      }
    }
  }
  return canonicalPathsLower;
}

function main(): void {
  console.log(`sync-winglet-docs: ${isCheckMode ? 'Checking' : 'Generating'} winglet documentation...\n`);

  const allPackages = discoverPackages();
  const packages = allPackages.filter(pkg => {
    if (pkg.namespace !== 'winglet') return false;
    if (packageFilter && pkg.shortName !== packageFilter) return false;
    return true;
  });

  if (packages.length === 0) {
    console.error('No winglet packages found. Ensure packages are built (dist/*.d.ts must exist).');
    process.exit(1);
  }

  console.log(`Found ${packages.length} winglet package(s).\n`);

  const totalResult = createSyncResult();
  let hasErrors = false;

  for (const pkg of packages) {
    console.log(`Processing ${pkg.name}...`);
    const pkgDocsDir = path.join(WINGLET_DOCS_DIR, pkg.shortName);
    const pkgResult = createSyncResult();
    const expectedFiles = new Set<string>();

    try {
      // Build list of entries to process: sub-path exports + root-only fallback
      const entries: Array<{ dtsPath: string; category: string }> = [];

      for (const sp of pkg.subPaths) {
        const category = exportKeyToCategory(sp.exportKey);
        if (category) entries.push({ dtsPath: sp.dtsPath, category });
      }

      // If no sub-paths, process root export directly
      if (entries.length === 0 && pkg.mainDtsPath) {
        entries.push({ dtsPath: pkg.mainDtsPath, category: '' });
      }

      const canonicalPathsLower = computeCanonicalPathsLower(entries, pkgDocsDir, pkg);

      for (const entry of entries) {
        const categoryDir = entry.category
          ? path.join(pkgDocsDir, entry.category)
          : pkgDocsDir;
        const symbolMap = resolveSymbolFiles(entry.dtsPath);
        const deprecatedExports = collectDeprecatedExports(entry.dtsPath);

        // Track unique source files to parse (multiple symbols can share a file)
        const fileSymbolNames = new Map<string, string[]>();
        for (const [symbolName, filePath] of Object.entries(symbolMap)) {
          const existing = fileSymbolNames.get(filePath);
          if (existing) {
            existing.push(symbolName);
          } else {
            fileSymbolNames.set(filePath, [symbolName]);
          }
        }

        // Parse each unique source file
        let symbolCount = 0;
        for (const [filePath, _symbolNames] of fileSymbolNames) {
          const parsed = parseRichJSDoc(filePath, pkg.name, pkg.version, entry.category || 'root');

          for (const fn of parsed) {
            // Skip types/interfaces that are not in the barrel's direct exports
            if (!symbolMap[fn.name]) continue;

            const mdxPath = path.join(categoryDir, `${fn.name}.mdx`);
            expectedFiles.add(mdxPath);

            // Skip only a deprecated alias whose path collides, case-insensitively,
            // with a canonical (non-deprecated) page; the path stays "expected"
            // either way, so cleanup never treats it as stale.
            const isDeprecated = fn.deprecated || deprecatedExports.has(fn.name);
            if (isDeprecated && canonicalPathsLower.has(mdxPath.toLowerCase())) continue;

            const mdxContent = generateMdx(fn);
            const status = writeDocFile(mdxPath, mdxContent, isCheckMode);

            switch (status) {
              case 'created': pkgResult.created++; break;
              case 'updated': pkgResult.updated++; break;
              case 'unchanged': pkgResult.unchanged++; break;
              case 'skipped': pkgResult.skipped++; break;
            }
            symbolCount++;
          }
        }

        // Write _category_.json for this category (only for sub-path categories)
        if (symbolCount > 0 && entry.category) {
          const meta = generateCategoryMeta(entry.category, pkg.shortName);
          const categoryJSON = serializeCategoryJSON(meta);
          ensureDir(categoryDir);
          const catStatus = writeCategoryJSON(categoryDir, categoryJSON, isCheckMode);
          if (catStatus === 'created') pkgResult.created++;
          else if (catStatus === 'updated') pkgResult.updated++;
        }
      }

      // Cleanup stale auto-generated files
      const stale = cleanupStaleFiles(pkgDocsDir, expectedFiles, isCheckMode);
      pkgResult.stale = stale;

      // Print per-package summary
      printPackageResult(pkg.name, pkgResult);

      // Accumulate totals
      totalResult.created += pkgResult.created;
      totalResult.updated += pkgResult.updated;
      totalResult.unchanged += pkgResult.unchanged;
      totalResult.skipped += pkgResult.skipped;
      totalResult.stale += pkgResult.stale;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ERROR  ${pkg.name}: ${message}`);
      hasErrors = true;
    }
  }

  // Summary
  console.log('\n--- Summary ---');
  console.log(
    `Created: ${totalResult.created}, Updated: ${totalResult.updated}, ` +
    `Unchanged: ${totalResult.unchanged}, Skipped (manual): ${totalResult.skipped}, ` +
    `Stale: ${totalResult.stale}`,
  );

  if (isCheckMode && (totalResult.created > 0 || totalResult.updated > 0 || totalResult.stale > 0)) {
    const staleCount = totalResult.created + totalResult.updated + totalResult.stale;
    console.log(`\n${staleCount} file(s) need updating.`);
    console.log('Run "yarn sync-winglet-docs" to update them.');
    process.exit(1);
  }

  if (hasErrors) {
    process.exit(1);
  }
}

function printPackageResult(name: string, result: DocSyncResult): void {
  const parts: string[] = [];
  if (result.created > 0) parts.push(`${result.created} created`);
  if (result.updated > 0) parts.push(`${result.updated} updated`);
  if (result.unchanged > 0) parts.push(`${result.unchanged} unchanged`);
  if (result.skipped > 0) parts.push(`${result.skipped} skipped`);
  if (result.stale > 0) parts.push(`${result.stale} stale`);
  console.log(`  ${name}: ${parts.join(', ') || 'no symbols found'}`);
}

main();
