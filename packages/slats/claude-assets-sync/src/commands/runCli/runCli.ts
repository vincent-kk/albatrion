import { Command } from 'commander';

import { logger } from '../../utils/logger.js';
import { VERSION } from '../../utils/version.js';
import type { DefaultFlags } from './type.js';
import { resolvePackage } from './utils/resolvePackage.js';
import { runInject } from './utils/runInject.js';

/**
 * CLI entry for `@slats/claude-assets-sync`.
 *
 * The `inject-claude-settings` dispatcher parses `--package=<name>` from argv,
 * resolves that single target's `package.json` via Node module resolution, and
 * injects its Claude assets into the selected `.claude/` directory.
 *
 * `src/core/**` never reads `package.json`. The dispatcher exception applies
 * only to the `bin/` layer — one named target per invocation, no discovery.
 */
export async function runCli(
  argv: readonly string[] = process.argv,
): Promise<void> {
  const cmd = new Command();

  cmd
    .name('inject-claude-settings')
    .description(
      "Inject a target consumer's Claude assets into the selected .claude directory",
    )
    .version(VERSION)
    .option(
      '--package <name>',
      'Target consumer package name (e.g. @canard/schema-form)',
    )
    .option(
      '--scope <scope>',
      'Target scope: user (~/.claude) | project (nearest ancestor .claude or <cwd>/.claude)',
    )
    .option('--dry-run', 'Preview without writing', false)
    .option('--force', 'Overwrite user modifications', false)
    .option('--root <path>', 'Override scope resolution cwd (default: cwd)')
    .action(async (flags: DefaultFlags) => {
      if (typeof flags.package !== 'string' || flags.package.length === 0) {
        logger.error(
          'missing required flag: --package <name> (e.g. --package=@canard/schema-form)',
        );
        process.exit(2);
      }
      const metadata = await resolvePackage(flags.package);
      await runInject(flags, metadata);
    });

  try {
    await cmd.parseAsync([...argv]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(msg);
    process.exit(1);
  }
}
