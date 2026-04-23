import { Command } from 'commander';

import { logger } from '../../utils/logger.js';
import { VERSION } from '../../utils/version.js';
import { buildHashesCmd } from '../buildHashesCmd/index.js';
import { listConsumers } from '../listConsumers/index.js';
import type { DefaultFlags, RunCliOptions } from './type.js';
import { runInject } from './utils/runInject.js';

/**
 * Top-level CLI entry for `@slats/claude-assets-sync`.
 *
 * Consumers' `bin/claude-sync.mjs` is a 3-line re-export stub that calls
 * `runCli(process.argv, { invokedFromBin: import.meta.url })`. The same
 * function also backs slats's own `claude-sync` bin (which omits
 * `invokedFromBin`).
 */
export async function runCli(
  argv: readonly string[] = process.argv,
  options: RunCliOptions = {},
): Promise<void> {
  const cmd = new Command();

  cmd
    .name('claude-sync')
    .description(
      'Inject Claude docs (skills, rules, commands) into .claude directories',
    )
    .version(options.version ?? VERSION);

  cmd
    .option('--package <name>', 'Inject a specific consumer by package name')
    .option('--all', 'Inject all discovered consumers', false)
    .option('--scope <scope>', 'Target: user | project | local')
    .option('--dry-run', 'Preview without writing', false)
    .option('--force', 'Overwrite user modifications', false)
    .option('--root <path>', 'Override discover walk origin (default: cwd)')
    .option(
      '--no-workspaces',
      'Disable yarn workspace package walking (shallow node_modules only)',
    )
    .action(async (flags: DefaultFlags) => {
      await runInject(flags, options);
    });

  cmd
    .command('list')
    .description('List discovered consumer packages with claude.assetPath')
    .option('--json', 'Emit JSON instead of a table', false)
    .option('--root <path>')
    .action(async (flags: { json?: boolean; root?: string }) => {
      await listConsumers({ cwd: flags.root, json: flags.json });
    });

  cmd
    .command('build-hashes [pkgRoot]')
    .description('Generate dist/claude-hashes.json for pkgRoot (default: cwd)')
    .action(async (pkgRoot?: string) => {
      await buildHashesCmd({ packageRoot: pkgRoot ?? process.cwd() });
    });

  try {
    await cmd.parseAsync([...argv]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(msg);
    process.exit(1);
  }
}
