import { Command } from 'commander';

import { logger } from '../../utils/logger.js';
import { VERSION } from '../../utils/version.js';
import type { DefaultFlags, RunCliOptions } from './type.js';
import { runInject } from './utils/runInject.js';

/**
 * CLI entry for `@slats/claude-assets-sync`.
 *
 * The caller passes its own package metadata (`packageRoot`, `packageName`,
 * `packageVersion`, `assetPath`) so the library never walks the filesystem
 * looking for consumers. Consumer bin stubs read their own `package.json`
 * and forward the resolved values here.
 */
export async function runCli(
  argv: readonly string[] = process.argv,
  options: RunCliOptions,
): Promise<void> {
  const cmd = new Command();

  cmd
    .name('claude-sync')
    .description(
      "Inject this package's assets into the target .claude directory",
    )
    .version(options.version ?? VERSION)
    .option('--scope <scope>', 'Target: user | project | local')
    .option('--dry-run', 'Preview without writing', false)
    .option('--force', 'Overwrite user modifications', false)
    .option('--root <path>', 'Override scope resolution cwd (default: cwd)')
    .action(async (flags: DefaultFlags) => {
      await runInject(flags, options);
    });

  try {
    await cmd.parseAsync([...argv]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(msg);
    process.exit(1);
  }
}
