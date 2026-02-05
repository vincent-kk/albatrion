/**
 * List command - list all synced packages
 */
import { render } from 'ink';
import pc from 'picocolors';
import React from 'react';

import { ListCommand } from '@/claude-assets-sync/components/list/ListCommand.js';
import { readUnifiedSyncMeta } from '@/claude-assets-sync/core/syncMeta.js';
import { logger } from '@/claude-assets-sync/utils/logger.js';
import { findGitRoot } from '@/claude-assets-sync/utils/package.js';

import type { ListCommandOptions, PackageListItem } from './types.js';

/**
 * Check if running in TTY (interactive terminal)
 */
function isTTY(): boolean {
  return process.stdout.isTTY === true && process.stdin.isTTY === true;
}

/**
 * Run the list command
 * @param options - List command options
 */
export const runListCommand = async (
  options: ListCommandOptions,
  cwd: string = process.cwd(),
): Promise<void> => {
  // Find git root (same as sync command)
  const destDir = findGitRoot(cwd) ?? cwd;

  // Read unified sync metadata
  const meta = readUnifiedSyncMeta(destDir);

  if (!meta || Object.keys(meta.packages).length === 0) {
    if (options.json) {
      console.log(JSON.stringify([], null, 2));
    } else {
      logger.info('No packages synced yet.');
    }
    return;
  }

  // JSON output mode
  if (options.json) {
    const packages: PackageListItem[] = [];

    for (const [, packageInfo] of Object.entries(meta.packages)) {
      const assets: Record<string, number> = {};
      let totalCount = 0;

      for (const [assetType, files] of Object.entries(packageInfo.files)) {
        const count = Array.isArray(files) ? files.length : 0;
        assets[assetType] = count;
        totalCount += count;
      }

      packages.push({
        name: packageInfo.originalName,
        version: packageInfo.version,
        syncedAt: meta.syncedAt,
        assetCount: totalCount,
        assets,
      });
    }

    packages.sort((a, b) => a.name.localeCompare(b.name));
    console.log(JSON.stringify(packages, null, 2));
    return;
  }

  // Interactive mode (TTY)
  if (isTTY()) {
    render(React.createElement(ListCommand, { cwd: destDir }));
    return;
  }

  // Fallback: Simple text output for non-TTY
  const packages: PackageListItem[] = [];

  for (const [, packageInfo] of Object.entries(meta.packages)) {
    const assets: Record<string, number> = {};
    let totalCount = 0;

    for (const [assetType, files] of Object.entries(packageInfo.files)) {
      const count = Array.isArray(files) ? files.length : 0;
      assets[assetType] = count;
      totalCount += count;
    }

    packages.push({
      name: packageInfo.originalName,
      version: packageInfo.version,
      syncedAt: meta.syncedAt,
      assetCount: totalCount,
      assets,
    });
  }

  packages.sort((a, b) => a.name.localeCompare(b.name));

  console.log(pc.bold('\nSynced Packages:\n'));

  for (const pkg of packages) {
    console.log(pc.cyan(`  ${pkg.name}@${pkg.version}`));
    console.log(`    Synced: ${new Date(pkg.syncedAt).toLocaleString()}`);
    console.log(`    Assets: ${pkg.assetCount} files`);

    const assetBreakdown = Object.entries(pkg.assets)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');
    console.log(`    Types: ${assetBreakdown}`);
    console.log('');
  }
};
