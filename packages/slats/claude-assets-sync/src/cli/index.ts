import { Command } from 'commander';

import { syncPackages } from '../core/sync';
import { logger } from '../utils/logger';
import type { CliOptions } from '../utils/types';

/**
 * Create and configure the CLI program
 */
export function createProgram(): Command {
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
    .action(async (opts) => {
      const options: CliOptions = {
        package: opts.package,
        force: opts.force,
        dryRun: opts.dryRun,
      };

      await runSync(options);
    });

  return program;
}

/**
 * Run the sync process
 */
async function runSync(options: CliOptions): Promise<void> {
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

  // Run sync
  const results = await syncPackages(options.package, {
    force: options.force,
    dryRun: options.dryRun,
  });

  // Exit with error code if any failed
  const hasFailures = results.some((r) => !r.success && !r.skipped);
  if (hasFailures) {
    process.exit(1);
  }
}

/**
 * Run the CLI
 */
export async function run(): Promise<void> {
  const program = createProgram();
  await program.parseAsync(process.argv);
}
