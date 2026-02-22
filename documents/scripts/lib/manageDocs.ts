import * as fs from 'node:fs';
import * as path from 'node:path';
import type { DocSyncResult } from './types';

const AUTO_MARKER = '<!-- sync-winglet-docs:auto -->';

/**
 * Ensure a directory exists, creating it recursively if needed.
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write or update a documentation file.
 *
 * - If the file doesn't exist: create it (or report in check mode).
 * - If the file exists and has the auto marker: update if content differs.
 * - If the file exists without the marker: skip (manual file).
 *
 * Returns 'created' | 'updated' | 'unchanged' | 'skipped'
 */
export function writeDocFile(
  filePath: string,
  content: string,
  checkMode: boolean,
): 'created' | 'updated' | 'unchanged' | 'skipped' {
  if (!fs.existsSync(filePath)) {
    if (checkMode) return 'created';
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf-8');
    return 'created';
  }

  const existing = fs.readFileSync(filePath, 'utf-8');

  // Check if it's a manually maintained file
  if (!existing.includes(AUTO_MARKER)) {
    return 'skipped';
  }

  // Compare content
  if (existing === content) {
    return 'unchanged';
  }

  if (checkMode) return 'updated';
  fs.writeFileSync(filePath, content, 'utf-8');
  return 'updated';
}

/**
 * Write or update a _category_.json file.
 */
export function writeCategoryJson(
  dirPath: string,
  content: string,
  checkMode: boolean,
): 'created' | 'updated' | 'unchanged' {
  const filePath = path.join(dirPath, '_category_.json');

  if (!fs.existsSync(filePath)) {
    if (checkMode) return 'created';
    ensureDir(dirPath);
    fs.writeFileSync(filePath, content, 'utf-8');
    return 'created';
  }

  const existing = fs.readFileSync(filePath, 'utf-8');
  if (existing === content) {
    return 'unchanged';
  }

  if (checkMode) return 'updated';
  fs.writeFileSync(filePath, content, 'utf-8');
  return 'updated';
}

/**
 * Remove auto-generated files that no longer have a source symbol.
 * Only removes files that contain the auto marker.
 */
export function cleanupStaleFiles(
  docsDir: string,
  expectedFiles: Set<string>,
  checkMode: boolean,
): number {
  let staleCount = 0;

  if (!fs.existsSync(docsDir)) return 0;

  const entries = walkDir(docsDir);

  for (const filePath of entries) {
    // Only consider .mdx files
    if (!filePath.endsWith('.mdx')) continue;

    // Skip files we expect to exist
    if (expectedFiles.has(filePath)) continue;

    // Only remove files with the auto marker
    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes(AUTO_MARKER)) continue;

    staleCount++;
    if (!checkMode) {
      fs.unlinkSync(filePath);
    }
  }

  return staleCount;
}

/**
 * Aggregate individual file results into a DocSyncResult summary.
 */
export function createSyncResult(): DocSyncResult {
  return { created: 0, updated: 0, unchanged: 0, skipped: 0, stale: 0 };
}

/** Recursively walk a directory and return all file paths. */
function walkDir(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}
