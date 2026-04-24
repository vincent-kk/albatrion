import { Command } from 'commander';

import { logger } from '../../utils/logger.js';
import { VERSION } from '../../utils/version.js';
import type { DefaultFlags } from './type.js';
import { renderOrFallback } from './utils/renderOrFallback.js';
import { resolveTargets } from './utils/resolveTargets.js';
import { toConsumerPackages } from './utils/toConsumerPackages.js';

/**
 * CLI entry for `@slats/claude-assets-sync`.
 *
 * The `inject-claude-settings` dispatcher parses `--package <name...>`
 * from argv and classifies each value:
 * - `@<scope>` — enumerate every workspace package under that scope
 * - `@<scope>/<name>` — one scoped package
 * - `<name>` — one unscoped package
 *
 * Targets are resolved via Node module resolution (`resolvePackage`)
 * except for scope aliases, which are the only path allowed to walk
 * the monorepo — that exception is isolated to `resolveScopeAlias.ts`.
 */
export async function runCli(
  argv: readonly string[] = process.argv,
): Promise<void> {
  const cmd = new Command();

  cmd
    .name('inject-claude-settings')
    .description(
      "Inject target consumer(s)' Claude assets into the selected .claude directory",
    )
    .version(VERSION)
    .option(
      '--package <name...>',
      'Target(s). "@<scope>" = whole npm scope; "@<scope>/<name>" or "<name>" = one package. Repeat the flag or comma-separate values.',
      collectPackageValues,
      [] as string[],
    )
    .option(
      '--scope <scope>',
      'Target scope: user (~/.claude) | project (nearest ancestor .claude or <cwd>/.claude)',
    )
    .option('--dry-run', 'Preview without writing', false)
    .option('--force', 'Overwrite user modifications', false)
    .option('--root <path>', 'Override scope resolution cwd (default: cwd)')
    .option(
      '--json',
      'Emit structured JSON output (forces non-interactive legacy logger path)',
      false,
    )
    .action(async (flags: DefaultFlags) => {
      const targets = flags.package ?? [];
      if (targets.length === 0) {
        logger.error(
          'missing required flag: --package <name> (e.g. --package=@canard/schema-form or --package=@canard)',
        );
        process.exit(2);
      }
      const originCwd = flags.root ?? process.cwd();
      const metadataList = await resolveTargets(targets, originCwd);
      if (metadataList.length === 0) {
        logger.warn(
          `no packages resolved from --package target(s): ${targets.join(', ')}`,
        );
        return;
      }
      const consumerPackages = await toConsumerPackages(metadataList);
      const exitCode = await renderOrFallback(
        consumerPackages,
        flags,
        originCwd,
      );
      if (exitCode !== 0) process.exit(exitCode);
    });

  try {
    await cmd.parseAsync([...argv]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(msg);
    process.exit(1);
  }
}

function collectPackageValues(
  value: string,
  previous: readonly string[] = [],
): string[] {
  return [
    ...previous,
    ...value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  ];
}
