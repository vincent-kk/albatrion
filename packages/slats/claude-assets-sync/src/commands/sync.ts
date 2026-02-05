/**
 * Sync command - sync Claude assets from npm packages
 */
import { syncPackages } from '@/claude-assets-sync/core/sync';
import { logger } from '@/claude-assets-sync/utils/logger';

import type { SyncCommandOptions } from './types';

/**
 * Run the sync command
 * @param options - Sync command options
 */
export const runSyncCommand = async (
  options: SyncCommandOptions,
): Promise<void> => {
  // Validate packages
  if (options.package.length === 0) {
    logger.error(
      'No packages specified. Use -p <package> to specify packages.',
    );
    logger.info('Example: claude-assets-sync -p @canard/schema-form');
    process.exit(1);
  }

  // Show dry-run notice
  if (options.dryRun) logger.dryRunNotice();

  // Show local mode notice
  if (options.local)
    logger.info(
      '[LOCAL MODE] Reading packages from workspace instead of node_modules\n',
    );

  // Run sync
  const results = await syncPackages(options.package, {
    force: options.force,
    dryRun: options.dryRun,
    local: options.local,
    ref: options.ref,
    flat: options.flat,
  });

  // Exit with error code if any failed
  const hasFailures = results.some((r) => !r.success && !r.skipped);
  if (hasFailures) process.exit(1);
};
