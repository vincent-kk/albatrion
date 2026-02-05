/**
 * Status command - show sync status of all packages
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

import { render } from 'ink';
import pc from 'picocolors';
import React from 'react';

import { StatusDisplay } from '@/claude-assets-sync/components/status';
import { readUnifiedSyncMeta } from '@/claude-assets-sync/core/syncMeta';
import { logger } from '@/claude-assets-sync/utils/logger';
import { findGitRoot } from '@/claude-assets-sync/utils/package';

import type {
  PackageStatusItem,
  RemoteVersionCache,
  StatusCommandOptions,
} from './types';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_FILE = '.sync-version-cache.json';

/**
 * Fetch remote version from npm registry
 * @param packageName - Package name
 * @returns Remote version or undefined on error
 */
const fetchRemoteVersion = async (
  packageName: string,
): Promise<string | undefined> => {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${packageName}/latest`,
      {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return undefined; // Package not found
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.version;
  } catch {
    // Handle timeout and other errors
    return undefined;
  }
};

/**
 * Read version cache from disk
 * @param cwd - Current working directory
 * @returns Cache object or empty cache
 */
const readVersionCache = (cwd: string): RemoteVersionCache => {
  try {
    const cachePath = path.join(cwd, '.claude', CACHE_FILE);
    const content = fs.readFileSync(cachePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
};

/**
 * Write version cache to disk
 * @param cwd - Current working directory
 * @param cache - Cache object
 */
const writeVersionCache = (cwd: string, cache: RemoteVersionCache): void => {
  try {
    const cachePath = path.join(cwd, '.claude', CACHE_FILE);
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  } catch {
    // Ignore write errors
  }
};

/**
 * Get remote version with caching
 * @param packageName - Package name
 * @param cwd - Current working directory
 * @returns Remote version or undefined
 */
const getCachedRemoteVersion = async (
  packageName: string,
  cwd: string,
): Promise<string | undefined> => {
  const cache = readVersionCache(cwd);
  const now = Date.now();

  // Check cache
  const cached = cache[packageName];
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.version;
  }

  // Fetch fresh version
  const version = await fetchRemoteVersion(packageName);

  if (version) {
    // Update cache
    cache[packageName] = {
      version,
      timestamp: now,
    };
    writeVersionCache(cwd, cache);
  }

  return version;
};

/**
 * Run the status command
 * @param options - Status command options
 */
export const runStatusCommand = async (
  options: StatusCommandOptions,
  cwd: string = process.cwd(),
): Promise<void> => {
  // Find git root (same as sync command)
  const destDir = findGitRoot(cwd) ?? cwd;

  // Read unified sync metadata
  const meta = readUnifiedSyncMeta(destDir);

  if (!meta || Object.keys(meta.packages).length === 0) {
    logger.info('No packages synced yet.');
    return;
  }

  const statuses: PackageStatusItem[] = [];

  // Fetch remote versions if not disabled
  for (const [, packageInfo] of Object.entries(meta.packages)) {
    let remoteVersion: string | undefined;
    let error: string | undefined;

    if (!options.noRemote) {
      try {
        remoteVersion = await getCachedRemoteVersion(
          packageInfo.originalName,
          destDir,
        );
      } catch (err) {
        error = err instanceof Error ? err.message : 'Unknown error';
      }
    }

    const upToDate =
      remoteVersion !== undefined && remoteVersion === packageInfo.version;

    // Count total files across all asset types
    let totalFiles = 0;
    for (const files of Object.values(packageInfo.files)) {
      totalFiles += Array.isArray(files) ? files.length : 0;
    }

    statuses.push({
      name: packageInfo.originalName,
      localVersion: packageInfo.version,
      remoteVersion,
      upToDate,
      syncedAt: meta.syncedAt,
      error,
      files: packageInfo.files,
      fileCount: totalFiles,
    });
  }

  // Sort by package name
  statuses.sort((a, b) => a.name.localeCompare(b.name));

  // Check if TTY is available for ink rendering
  if (process.stdout.isTTY) {
    // Map statuses to component props format
    const packages = statuses.map((s) => ({
      name: s.name,
      localVersion: s.localVersion,
      remoteVersion: s.remoteVersion,
      status: s.error
        ? ('error' as const)
        : s.upToDate
          ? ('up-to-date' as const)
          : s.remoteVersion
            ? ('outdated' as const)
            : ('unknown' as const),
      syncedAt: s.syncedAt,
      error: s.error,
      files: s.files,
      fileCount: s.fileCount,
    }));

    // Calculate summary
    const summary = {
      upToDate: statuses.filter((s) => s.upToDate).length,
      outdated: statuses.filter((s) => s.remoteVersion && !s.upToDate).length,
      error: statuses.filter((s) => s.error).length,
      unknown: statuses.filter(
        (s) => !s.remoteVersion && !s.error && !options.noRemote,
      ).length,
    };

    // Render with ink
    render(
      React.createElement(StatusDisplay, {
        packages,
        loading: false,
        summary,
      }),
    );
  } else {
    // Fallback to plain text output for non-TTY environments
    console.log(pc.bold('\nPackage Status:\n'));

    for (const status of statuses) {
      const icon = status.upToDate
        ? pc.green('✓')
        : status.remoteVersion
          ? pc.yellow('⚠')
          : pc.gray('?');

      console.log(`  ${icon} ${pc.cyan(status.name)}`);
      console.log(`      Local:  ${status.localVersion}`);

      if (status.remoteVersion) {
        console.log(`      Remote: ${status.remoteVersion}`);
      } else if (status.error) {
        console.log(`      Remote: ${pc.red('Error:')} ${status.error}`);
      } else if (options.noRemote) {
        console.log(`      Remote: ${pc.gray('(check skipped)')}`);
      } else {
        console.log(`      Remote: ${pc.gray('(not available)')}`);
      }

      if (status.remoteVersion && !status.upToDate) {
        console.log(`      Status: ${pc.yellow('Update available')}`);
      } else if (status.upToDate) {
        console.log(`      Status: ${pc.green('Up to date')}`);
      }

      console.log(
        `      Synced: ${new Date(status.syncedAt).toLocaleString()}`,
      );
      console.log('');
    }

    // Summary
    const upToDateCount = statuses.filter((s) => s.upToDate).length;
    const updateAvailable = statuses.filter(
      (s) => s.remoteVersion && !s.upToDate,
    ).length;

    if (!options.noRemote) {
      console.log(
        pc.gray(
          `Summary: ${upToDateCount} up to date, ${updateAvailable} updates available\n`,
        ),
      );
    }
  }
};
