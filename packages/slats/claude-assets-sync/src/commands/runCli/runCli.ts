import { basename } from 'node:path';

import { Command } from 'commander';

import { logger } from '../../utils/logger.js';
import { VERSION } from '../../utils/version.js';
import type { DefaultFlags } from './type.js';
import { renderOrFallback } from './utils/renderOrFallback.js';
import { resolveTargets } from './utils/resolveTargets.js';
import { toConsumerPackages } from './utils/toConsumerPackages.js';

const FALLBACK_PROGRAM_NAME = 'inject-claude-settings';

/**
 * CLI entry for `@slats/claude-assets-sync`.
 *
 * The `inject-claude-settings` dispatcher parses `--package <name...>`
 * from argv and classifies each value:
 * - `@<scope>` — enumerate every installed `node_modules/@<scope>/*`
 *   package that declares `claude.assetPath`
 * - `@<scope>/<name>` — one scoped package
 * - `<name>` — one unscoped package
 *
 * Targets are resolved via Node module resolution (`resolvePackage`)
 * except for scope aliases, which are the only path allowed to walk
 * `node_modules` siblings — that exception is isolated to
 * `resolveScopeAlias.ts`.
 */
export async function runCli(
  argv: readonly string[] = process.argv,
): Promise<void> {
  const cmd = new Command();

  cmd
    .name(deriveProgramName(argv))
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

// Derive the program name shown in commander's help/error output from
// the actual invocation. `npx @slats/claude-assets-sync ...` runs the
// `claude-assets-sync` bin, while a locally installed user runs
// `inject-claude-settings ...` — both should self-identify correctly.
function deriveProgramName(argv: readonly string[]): string {
  const argv1 = argv[1];
  if (typeof argv1 !== 'string' || argv1.length === 0) {
    return FALLBACK_PROGRAM_NAME;
  }
  const base = basename(argv1).replace(/\.(mjs|cjs|js)$/, '');
  return base.length > 0 ? base : FALLBACK_PROGRAM_NAME;
}
