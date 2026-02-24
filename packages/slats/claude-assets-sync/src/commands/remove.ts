/**
 * Remove command - remove a synced package
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

import { render } from 'ink';
import pc from 'picocolors';
import React from 'react';

import { RemoveConfirm } from '@/claude-assets-sync/components/remove/RemoveConfirm';
import {
  readUnifiedSyncMeta,
  writeUnifiedSyncMeta,
} from '@/claude-assets-sync/core/syncMeta';
import { logger } from '@/claude-assets-sync/utils/logger';
import { packageNameToPrefix } from '@/claude-assets-sync/utils/packageName.js';
import type { SkillUnit } from '@/claude-assets-sync/utils/types';

import type { RemoveCommandOptions } from './types';

/**
 * Check if running in TTY (interactive terminal)
 */
function isTTY(): boolean {
  return process.stdout.isTTY === true && process.stdin.isTTY === true;
}

/**
 * Perform the actual file removal and metadata update
 */
function performRemoval(
  filesToRemove: Array<{ assetType: string; path: string }>,
  meta: ReturnType<typeof readUnifiedSyncMeta>,
  prefix: string,
  packageName: string,
  cwd: string,
): void {
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
  if (meta) {
    delete meta.packages[prefix];
    meta.syncedAt = new Date().toISOString();
    writeUnifiedSyncMeta(cwd, meta);
  }

  logger.success(`\nRemoved package ${packageName}`);
}

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

    const units = files as SkillUnit[];
    const firstUnit = units[0];

    if (firstUnit.transformed) {
      // Flat structure: remove prefixed files/directories from shared directory
      for (const unit of units) {
        const targetPath = path.join(
          cwd,
          '.claude',
          assetType,
          unit.transformed!,
        );
        filesToRemove.push({ assetType, path: targetPath });
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
    if (isTTY()) {
      // Interactive ink-based confirmation
      let confirmed = false;

      const { waitUntilExit } = render(
        React.createElement(RemoveConfirm, {
          packageName,
          filesToRemove,
          onConfirm: (result: boolean) => {
            confirmed = result;
          },
        }),
      );

      await waitUntilExit();

      if (!confirmed) {
        logger.info('Cancelled.');
        return;
      }
    } else {
      // Non-TTY: skip interactive confirmation, treat as cancelled
      logger.info('Cancelled (non-interactive terminal).');
      return;
    }
  }

  performRemoval(filesToRemove, meta, prefix, packageName, cwd);
};
