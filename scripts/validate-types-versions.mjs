#!/usr/bin/env node

/**
 * Validates that `typesVersions` in package.json is in sync with `exports`.
 *
 * For every sub-path export (excluding "."), there must be a matching entry
 * in typesVersions["*"] pointing to the same .d.ts file as the exports "types" condition.
 *
 * Usage: node scripts/validate-types-versions.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PACKAGES_DIR = join(ROOT, 'packages');

function findAllPackageJsons(baseDir) {
  const results = [];

  function walk(dir, depth) {
    if (depth > 4) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, depth + 1);
      } else if (entry.name === 'package.json') {
        results.push(fullPath);
      }
    }
  }

  walk(baseDir, 0);
  return results;
}

function stripDotSlash(path) {
  return path.replace(/^\.\//, '');
}

function validate() {
  const packageJsonFiles = findAllPackageJsons(PACKAGES_DIR);
  let hasError = false;
  let checkedCount = 0;

  for (const pkgPath of packageJsonFiles) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    if (!pkg.exports || typeof pkg.exports !== 'object') continue;

    const subPaths = Object.keys(pkg.exports).filter((key) => key !== '.');
    if (subPaths.length === 0) continue;

    checkedCount++;
    const pkgDir = join(pkgPath, '..');
    const pkgName = pkg.name || pkgPath;

    if (!pkg.typesVersions || !pkg.typesVersions['*']) {
      console.error(`❌ ${pkgName}: has ${subPaths.length} sub-path exports but no typesVersions["*"]`);
      hasError = true;
      continue;
    }

    const tvEntries = pkg.typesVersions['*'];

    for (const subPath of subPaths) {
      const bareKey = subPath.replace(/^\.\//, '');
      const exportTypes = pkg.exports[subPath]?.types;

      if (!exportTypes) {
        console.warn(`⚠️  ${pkgName}: export "${subPath}" has no "types" condition`);
        continue;
      }

      if (!tvEntries[bareKey]) {
        console.error(`❌ ${pkgName}: export "${subPath}" has no matching typesVersions entry for "${bareKey}"`);
        hasError = true;
        continue;
      }

      const tvPath = tvEntries[bareKey][0];
      const expectedPath = stripDotSlash(exportTypes);

      if (tvPath !== expectedPath) {
        console.error(`❌ ${pkgName}: typesVersions["*"]["${bareKey}"] = "${tvPath}" but exports types = "${expectedPath}"`);
        hasError = true;
        continue;
      }

      const dtsPath = join(pkgDir, tvPath);
      if (existsSync(join(pkgDir, 'dist')) && !existsSync(dtsPath)) {
        console.warn(`⚠️  ${pkgName}: "${tvPath}" does not exist on disk (run build first?)`);
      }
    }

    for (const tvKey of Object.keys(tvEntries)) {
      const exportKey = `./${tvKey}`;
      if (!pkg.exports[exportKey]) {
        console.error(`❌ ${pkgName}: typesVersions has "${tvKey}" but no matching export "./${tvKey}"`);
        hasError = true;
      }
    }
  }

  if (checkedCount === 0) {
    console.log('No packages with sub-path exports found.');
    return;
  }

  if (hasError) {
    console.error(`\n❌ Validation failed. Fix the mismatches above.`);
    process.exit(1);
  } else {
    console.log(`✅ All ${checkedCount} packages with sub-path exports have valid typesVersions.`);
  }
}

validate();
