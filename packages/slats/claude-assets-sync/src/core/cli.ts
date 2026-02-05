import { Command } from 'commander';

import {
  runAddCommand,
  runListCommand,
  runMigrateCommand,
  runRemoveCommand,
  runStatusCommand,
  runSyncCommand,
} from '../commands';
import { VERSION } from '../version';

/**
 * Create and configure the CLI program
 */
export const createProgram = (): Command => {
  const program = new Command();

  // Main program (no action - delegates to subcommands)
  program
    .name('claude-assets-sync')
    .description(
      'Sync Claude commands and skills from npm packages to your project',
    )
    .version(VERSION);

  // Sync command (explicit subcommand, also works as default)
  program
    .command('sync', { isDefault: true })
    .description('Sync Claude assets from npm packages')
    .option(
      '-p, --package <name>',
      'Package name to sync (can be specified multiple times)',
      (value: string, previous: string[]) => [...previous, value],
      [] as string[],
    )
    .option('-f, --force', 'Force sync even if version matches', false)
    .option('--dry-run', 'Preview changes without writing files', false)
    .option(
      '-l, --local',
      'Read packages from local workspace instead of node_modules',
      false,
    )
    .option(
      '-r, --ref <ref>',
      'Git ref (branch, tag, or commit) to fetch from (overrides version tag)',
    )
    .option(
      '--no-flat',
      'Use legacy nested directory structure instead of flat structure (default: flat)',
    )
    .action(async (opts) => {
      await runSyncCommand({
        package: opts.package,
        force: opts.force,
        dryRun: opts.dryRun,
        local: opts.local,
        ref: opts.ref,
        flat: opts.flat,
      });
    });

  // Add command
  program
    .command('add')
    .description('Add a package with interactive asset selection')
    .requiredOption('-p, --package <name>', 'Package name to add')
    .option(
      '-l, --local',
      'Read packages from local workspace instead of node_modules',
      false,
    )
    .option('-r, --ref <ref>', 'Git ref (branch, tag, or commit) to fetch from')
    .action(async (opts) => {
      await runAddCommand({
        package: opts.package,
        local: opts.local,
        ref: opts.ref,
      });
    });

  // List command
  program
    .command('list')
    .description('List all synced packages')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      await runListCommand({ json: opts.json });
    });

  // Remove command
  program
    .command('remove')
    .description('Remove a synced package')
    .requiredOption('-p, --package <name>', 'Package name to remove')
    .option('-y, --yes', 'Skip confirmation prompt')
    .option('--dry-run', 'Preview changes without removing files')
    .action(async (opts) => {
      await runRemoveCommand({
        package: opts.package,
        yes: opts.yes,
        dryRun: opts.dryRun,
      });
    });

  // Status command
  program
    .command('status')
    .description('Show sync status of all packages')
    .option('--no-remote', 'Skip remote version check')
    .action(async (opts) => {
      await runStatusCommand({ noRemote: !opts.remote });
    });

  // Migration command
  program
    .command('migrate')
    .description('Migrate from legacy nested structure to flat structure')
    .option('--dry-run', 'Preview migration without making changes')
    .action(async (opts) => {
      await runMigrateCommand({ dryRun: opts.dryRun });
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
