import { basename } from 'node:path';

import { Command } from 'commander';

import type { DefaultFlags } from '../../types/index.js';
import { divertLogsToStderr, logger } from '../../utils/logger.js';
import { VERSION } from '../../utils/version.js';
import { resolveAssetPathFlag } from './flags/resolveAssetPathFlag.js';
import { renderOrFallback } from './renderers/renderOrFallback.js';
import { resolveTargets } from './targets/resolveTargets.js';
import { selectInjectableTargets } from './targets/selectInjectableTargets.js';
import { toConsumerPackages } from './targets/toConsumerPackages.js';

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
 * `--asset-path` names the asset root instead, for a package that ships one
 * without declaring it. It overrides `agents.assetPath` on every target and
 * makes the named directory the only source of hashes.
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
    .option(
      '--asset-path <path>',
      'Asset root relative to each target package root. Overrides "agents.assetPath" and hashes that directory at run time, so no dist/agents-hashes.json is needed.',
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
      'Emit one JSON document on stdout and divert all diagnostics to stderr',
      false,
    )
    .action(async (flags: DefaultFlags) => {
      // stdout belongs to the JSON document alone; every diagnostic from here
      // on — including the exits below — has to go to stderr instead.
      if (flags.json) divertLogsToStderr();
      const targets = flags.package ?? [];
      if (targets.length === 0) {
        logger.error(
          'missing required flag: --package <name> (e.g. --package=@canard/schema-form or --package=@canard)',
        );
        process.exit(2);
      }
      const assetPath = resolveAssetPathFlag(flags.assetPath);
      const originCwd = flags.root ?? process.cwd();
      const { resolved, skipped, strict } = await resolveTargets(
        targets,
        originCwd,
        assetPath,
      );
      if (resolved.length === 0) {
        logger.warn(
          `no packages resolved from --package target(s): ${targets.join(', ')}`,
        );
        // Resolving nothing is a run that did nothing, not a failure — but a
        // `--json` reader cannot tell that from a crash unless it still gets a
        // document, so only the transcript path stops here.
        if (!flags.json) return;
      }
      const consumerPackages = await toConsumerPackages(resolved);
      // A target that can supply no hashes fails the way a package with no
      // `agents.assetPath` does: fatal when the run named one package, a
      // reported skip in a batch. Deciding it here rather than inside each
      // renderer is what keeps the verdict from depending on `--json`.
      const injectable = selectInjectableTargets(consumerPackages, skipped);
      if (strict && injectable.length < consumerPackages.length)
        process.exit(2);
      const exitCode = await renderOrFallback(
        injectable,
        flags,
        originCwd,
        skipped,
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
