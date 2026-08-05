import { basename } from 'node:path';

import { Command } from 'commander';

import { logger } from '../../utils/logger.js';
import { VERSION } from '../../utils/version.js';
import type { DefaultFlags } from './type.js';
import { renderOrFallback } from './utils/renderOrFallback.js';
import { resolveTargets } from './utils/resolveTargets.js';
import { toConsumerPackages } from './utils/toConsumerPackages.js';

const FALLBACK_PROGRAM_NAME = 'inject-agents-settings';

/**
 * CLI entry for `@slats/agents-assets-sync`.
 *
 * Every step is reachable by flag, so an agent can drive the whole run
 * without a prompt: `--agent` picks the agents, `--asset` narrows the kinds,
 * `--yes` approves confirmations and `--no-interactive` forbids prompting
 * outright.
 *
 * The `inject-agents-settings` dispatcher parses `--package <name...>`
 * from argv and classifies each value:
 * - `@<scope>` — enumerate every installed `node_modules/@<scope>/*`
 *   package that declares `agents.assetPath`
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
      collectValues,
      [] as string[],
    )
    .option(
      '--agent <type...>',
      'Target agent(s): claude | codex | agents. Repeat the flag or comma-separate values. Omitted on a TTY, the CLI asks.',
      collectValues,
      [] as string[],
    )
    .option(
      '--scope <scope>',
      'Target scope: user (home) | project (nearest ancestor owning .claude, AGENTS.md, .codex or .git)',
    )
    .option(
      '--asset <kind...>',
      'Asset kind(s) to inject: skills | rules | commands. Default: all.',
      collectValues,
      [] as string[],
    )
    .option('--dry-run', 'Preview without writing', false)
    .option('--force', 'Overwrite user modifications', false)
    .option('--yes', 'Auto-approve every confirmation prompt', false)
    .option(
      '--no-interactive',
      'Never prompt; a missing required flag exits 2 even on a TTY',
    )
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

// Shared collector for every variadic flag: appends and comma-splits, so
// `--flag a,b --flag c` and `--flag a --flag b --flag c` agree.
function collectValues(
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
// the actual invocation. `npx @slats/agents-assets-sync ...` runs the
// `agents-assets-sync` bin, while a locally installed user runs
// `inject-agents-settings ...` — both should self-identify correctly.
function deriveProgramName(argv: readonly string[]): string {
  const argv1 = argv[1];
  if (typeof argv1 !== 'string' || argv1.length === 0) {
    return FALLBACK_PROGRAM_NAME;
  }
  const base = basename(argv1).replace(/\.(mjs|cjs|js)$/, '');
  return base.length > 0 ? base : FALLBACK_PROGRAM_NAME;
}
