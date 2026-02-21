#!/usr/bin/env tsx
/**
 * sync-api-docs — Auto-generate <ForAI> sections in MDX docs from .d.ts files.
 *
 * Only touches ForAI sections marked with <!-- sync-api-docs:auto -->.
 * Hand-written ForAI sections (without the marker) are never modified.
 *
 * Usage:
 *   tsx scripts/sync-api-docs.ts           # Update auto-generated ForAI sections
 *   tsx scripts/sync-api-docs.ts --check   # Validate only (exit 1 if stale)
 */
import { discoverPackages } from './lib/packageRegistry';
import { extractExports } from './lib/extractExports';
import { formatForAI } from './lib/formatForAI';
import { updateMdxForAI, readCurrentForAI, getForAIStatus } from './lib/updateMdxForAI';
import type { SubPathExports, SyncResult } from './lib/types';

const isCheckMode = process.argv.includes('--check');

function main(): void {
  console.log(`sync-api-docs: ${isCheckMode ? 'Checking' : 'Updating'} ForAI sections...\n`);
  console.log('Note: Hand-written ForAI sections (without auto marker) are skipped.\n');

  const packages = discoverPackages();

  if (packages.length === 0) {
    console.error('No packages found. Ensure packages are built (dist/*.d.ts must exist).');
    process.exit(1);
  }

  console.log(`Found ${packages.length} packages with documentation.\n`);

  const results: SyncResult[] = [];
  let staleCount = 0;

  for (const pkg of packages) {
    try {
      // Check if ForAI section is auto-managed or hand-written
      const forAIStatus = getForAIStatus(pkg.mdxPath);

      if (forAIStatus === 'manual') {
        results.push({ package: pkg.name, status: 'skipped', message: 'Hand-written ForAI (no auto marker)' });
        console.log(`  MANUAL ${pkg.name} (skipped)`);
        continue;
      }

      // Extract exports from all sub-paths + root
      const allExports: SubPathExports[] = [];

      // Root exports
      const rootSymbols = extractExports(pkg.mainDtsPath);
      if (rootSymbols.length > 0) {
        allExports.push({ exportKey: '.', symbols: rootSymbols });
      }

      // Sub-path exports
      for (const sp of pkg.subPaths) {
        const symbols = extractExports(sp.dtsPath);
        if (symbols.length > 0) {
          allExports.push({ exportKey: sp.exportKey, symbols });
        }
      }

      if (allExports.length === 0) {
        results.push({ package: pkg.name, status: 'skipped', message: 'No exports found in .d.ts' });
        console.log(`  SKIP   ${pkg.name} (no exports)`);
        continue;
      }

      // Generate new ForAI content
      const newContent = formatForAI(pkg, allExports);

      if (isCheckMode) {
        if (forAIStatus === 'none') {
          staleCount++;
          results.push({ package: pkg.name, status: 'updated', message: 'Missing auto ForAI section' });
          console.log(`  STALE  ${pkg.name} (no ForAI section)`);
        } else {
          // Compare with current content
          const current = readCurrentForAI(pkg.mdxPath);
          const normalized = newContent.trim();
          if (current !== normalized) {
            staleCount++;
            results.push({ package: pkg.name, status: 'updated', message: 'ForAI section is stale' });
            console.log(`  STALE  ${pkg.name}`);
          } else {
            results.push({ package: pkg.name, status: 'unchanged', message: 'Up to date' });
            console.log(`  OK     ${pkg.name}`);
          }
        }
      } else {
        // Update the MDX file
        const result = updateMdxForAI(pkg.mdxPath, newContent);
        if (result === 'updated') {
          results.push({ package: pkg.name, status: 'updated', message: 'ForAI section updated' });
          console.log(`  UPDATED  ${pkg.name}`);
        } else if (result === 'skipped') {
          results.push({ package: pkg.name, status: 'skipped', message: 'Hand-written ForAI' });
          console.log(`  MANUAL   ${pkg.name} (skipped)`);
        } else {
          results.push({ package: pkg.name, status: 'unchanged', message: 'Already up to date' });
          console.log(`  OK       ${pkg.name}`);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ package: pkg.name, status: 'error', message });
      console.error(`  ERROR  ${pkg.name}: ${message}`);
    }
  }

  // Summary
  console.log('\n--- Summary ---');
  const updated = results.filter(r => r.status === 'updated').length;
  const unchanged = results.filter(r => r.status === 'unchanged').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log(`Updated: ${updated}, Unchanged: ${unchanged}, Skipped (manual): ${skipped}, Errors: ${errors}`);

  if (isCheckMode && staleCount > 0) {
    console.log(`\n${staleCount} package(s) have stale auto-generated ForAI sections.`);
    console.log('Run "yarn sync-api-docs" to update them.');
    process.exit(1);
  }

  if (errors > 0) {
    process.exit(1);
  }
}

main();
