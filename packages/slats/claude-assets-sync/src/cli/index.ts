import { Command } from 'commander';

import { syncPackages } from '../core/sync';
import { logger } from '../utils/logger';
import type { CliOptions } from '../utils/types';

/**
 * Run the sync process
 */
const runSync = async (options: CliOptions): Promise<void> => {
  // Validate packages
  if (options.package.length === 0) {
    logger.error('No packages specified. Use -p <package> to specify packages.');
    logger.info('Example: claude-assets-sync -p @canard/schema-form');
    process.exit(1);
  }

  // Show dry-run notice
  if (options.dryRun) {
    logger.dryRunNotice();
  }

  // Show local mode notice
  if (options.local) {
    logger.info('[LOCAL MODE] Reading packages from workspace instead of node_modules\n');
  }

  // Run sync
  const results = await syncPackages(options.package, {
    force: options.force,
    dryRun: options.dryRun,
    local: options.local,
    ref: options.ref,
  });

  // Exit with error code if any failed
  const hasFailures = results.some((r) => !r.success && !r.skipped);
  if (hasFailures) {
    process.exit(1);
  }
};

/**
 * Create and configure the CLI program
 */
export const createProgram = (): Command => {
  const program = new Command();

  program
    .name('claude-assets-sync')
    .description(
      'Sync Claude commands and skills from npm packages to your project',
    )
    .version('0.1.0')
    .option(
      '-p, --package <name>',
      'Package name to sync (can be specified multiple times)',
      (value: string, previous: string[]) => [...previous, value],
      [] as string[],
    )
    .option('-f, --force', 'Force sync even if version matches', false)
    .option('--dry-run', 'Preview changes without writing files', false)
    .option('-l, --local', 'Read packages from local workspace instead of node_modules', false)
    .option('-r, --ref <ref>', 'Git ref (branch, tag, or commit) to fetch from (overrides version tag)')
    .action(async (opts) => {
      const options: CliOptions = {
        package: opts.package,
        force: opts.force,
        dryRun: opts.dryRun,
        local: opts.local,
        ref: opts.ref,
      };

      await runSync(options);
    });

  return program;
};

/**
 * Run the CLI
 */
export const run = async (): Promise<void> => {
  const program = createProgram();
  await program.parseAsync(process.argv);
};
