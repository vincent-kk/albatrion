/**
 * Remove command - remove a synced package
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline/promises';

import pc from 'picocolors';

import {
  readUnifiedSyncMeta,
  writeUnifiedSyncMeta,
} from '@/claude-assets-sync/core/syncMeta';
import { logger } from '@/claude-assets-sync/utils/logger';
import { packageNameToPrefix } from '@/claude-assets-sync/utils/packageName.js';
import type { FileMapping } from '@/claude-assets-sync/utils/types';

import type { RemoveCommandOptions } from './types';

/**
 * Run the remove command
 * @param options - Remove command options
 */
export const runRemoveCommand = async (
  options: RemoveCommandOptions,
  cwd: string = process.cwd(),
): Promise<void> => {
  const { package: packageName, yes, dryRun } = options;
  const prefix = packageNameToPrefix(packageName);

  // Read unified sync metadata
  const meta = readUnifiedSyncMeta(cwd);

  if (!meta || !meta.packages || !meta.packages[prefix]) {
    logger.error(`Package ${packageName} is not synced.`);
    process.exit(1);
    return; // For tests where process.exit is mocked
  }

  const packageInfo = meta.packages[prefix];

  if (!packageInfo || !packageInfo.files) {
    logger.error(`Package ${packageName} has no files to remove.`);
    process.exit(1);
    return; // For tests where process.exit is mocked
  }

  // Calculate files to remove
  const filesToRemove: Array<{ assetType: string; path: string }> = [];

  for (const [assetType, files] of Object.entries(packageInfo.files)) {
    if (!Array.isArray(files) || files.length === 0) continue;

    // Determine structure type from first file
    const firstFile = files[0];
    const isFlat = typeof firstFile === 'object' && 'transformed' in firstFile;

    if (isFlat) {
      // Flat structure: remove prefixed files from shared directory
      for (const file of files as FileMapping[]) {
        const filePath = path.join(cwd, '.claude', assetType, file.transformed);
        filesToRemove.push({ assetType, path: filePath });
      }
    } else {
      // Nested structure: remove package directory
      const dirPath = path.join(cwd, '.claude', assetType, packageName);
      filesToRemove.push({ assetType, path: dirPath });
    }
  }

  // Show what will be removed
  console.log(pc.bold('\nFiles to remove:\n'));
  for (const { assetType, path: filePath } of filesToRemove) {
    console.log(`  ${pc.red('-')} ${assetType}: ${filePath}`);
  }
  console.log('');

  // Dry run mode
  if (dryRun) {
    logger.info('[DRY RUN] No changes made.');
    return;
  }

  // Confirmation prompt
  if (!yes) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await rl.question(pc.yellow('Remove these files? (y/N): '));
    rl.close();

    if (answer.toLowerCase() !== 'y') {
      logger.info('Cancelled.');
      return;
    }
  }

  // Remove files
  for (const { path: filePath } of filesToRemove) {
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`${pc.red('-')} ${filePath}`);
      } else {
        fs.unlinkSync(filePath);
        console.log(`${pc.red('-')} ${filePath}`);
      }
    } catch (error) {
      // Ignore errors if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.error(`Failed to remove ${filePath}: ${error}`);
      }
    }
  }

  // Update metadata
  delete meta.packages[prefix];
  meta.syncedAt = new Date().toISOString();
  writeUnifiedSyncMeta(cwd, meta);

  logger.success(`\nRemoved package ${packageName}`);
};
