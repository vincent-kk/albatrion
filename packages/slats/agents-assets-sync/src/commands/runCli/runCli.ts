import { basename, isAbsolute, resolve as resolvePath } from 'node:path';

import { Command, CommanderError } from 'commander';

import { type RunFailure, validateFlags } from '../../core/index.js';
import type { DefaultFlags } from '../../types/index.js';
import { divertLogsToStderr, logger } from '../../utils/logger.js';
import { VERSION } from '../../utils/version.js';
import { renderOrFallback } from './renderers/renderOrFallback.js';
import { classifyTarget } from './targets/classifyTarget.js';
import { resolveTargets } from './targets/resolveTargets.js';
import { selectInjectableTargets } from './targets/selectInjectableTargets.js';
import { toConsumerPackages } from './targets/toConsumerPackages.js';
import { createFailureResult } from './utils/createFailureResult.js';

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
  cmd.exitOverride();
  if (argv.includes('--json'))
    cmd.configureOutput({
      writeOut: (text) => {
        process.stderr.write(text);
      },
    });
  let exitCode = 0;
  const diagnostics: RunFailure[] = [];

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
      'Target scope: user (home) | project (nearest ancestor owning .git, a workspace manifest or a lockfile; else the nearest owning .claude, AGENTS.md, .agents or .codex)',
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
      const errors: string[] = [];
      if (targets.length === 0)
        errors.push('missing required flag: --package <name>');
      for (const target of targets) {
        const classified = classifyTarget(target);
        if (classified.kind === 'invalid') errors.push(classified.reason);
      }
      const assetPath = flags.assetPath?.trim();
      if (
        assetPath !== undefined &&
        (!assetPath || isAbsolute(assetPath) || assetPath.startsWith('~'))
      )
        errors.push(`Invalid --asset-path: ${flags.assetPath}`);
      const checked = validateFlags(flags, true);
      if ('errors' in checked) errors.push(...checked.errors);
      if (errors.length) {
        const result = createFailureResult(
          errors,
          2,
          Boolean(flags.dryRun),
          targets.join(','),
        );
        await renderOrFallback(
          [],
          flags,
          resolvePath(flags.root ?? process.cwd()),
          [],
          {},
          result,
        );
        exitCode = result.exitCode;
        return;
      }
      const originCwd = resolvePath(flags.root ?? process.cwd());
      const { resolved, skipped, strict } = await resolveTargets(
        targets,
        originCwd,
        assetPath,
        (reason) => {
          throw Object.assign(new Error(reason), { exitCode: 2 });
        },
        diagnostics,
      );
      if (resolved.length === 0) {
        logger.warn(
          `no packages resolved from --package target(s): ${targets.join(', ')}`,
        );
        // Resolving nothing is a run that did nothing, not a failure — but a
        // `--json` reader cannot tell that from a crash unless it still gets a
        // document, so only the transcript path stops here.
        // Empty runs still pass through core validation and formatting.
      }
      const consumerPackages = await toConsumerPackages(resolved);
      // A target that can supply no hashes fails the way a package with no
      // `agents.assetPath` does: fatal when the run named one package, a
      // reported skip in a batch. Deciding it here rather than inside each
      // renderer is what keeps the verdict from depending on `--json`.
      const injectable = selectInjectableTargets(
        consumerPackages,
        skipped,
        diagnostics,
      );
      if (strict && injectable.length < consumerPackages.length) {
        await renderOrFallback(
          [],
          flags,
          originCwd,
          [],
          {},
          createFailureResult(
            skipped,
            2,
            Boolean(flags.dryRun),
            targets.join(','),
            diagnostics,
          ),
        );
        exitCode = 2;
        return;
      }
      exitCode = await renderOrFallback(
        injectable,
        flags,
        originCwd,
        skipped,
        {},
        undefined,
        diagnostics,
      );
    });

  try {
    await cmd.parseAsync([...argv]);
  } catch (err) {
    if (
      err instanceof CommanderError ||
      (err instanceof Error && 'exitCode' in err && err.exitCode === 2)
    ) {
      if (err instanceof CommanderError && err.exitCode === 0) {
        if (argv.includes('--json'))
          await renderOrFallback(
            [],
            { json: true },
            process.cwd(),
            [],
            {},
            {
              units: [],
              errors: [],
              failures: [],
              notices: [],
              exitCode: 0,
              dryRun: argv.includes('--dry-run'),
            },
          );
        return;
      }
      const result = createFailureResult(
        [err.message],
        2,
        argv.includes('--dry-run'),
        err instanceof CommanderError
          ? (/--[\w-]+/.exec(err.message)?.[0] ?? 'argv')
          : argv
              .slice(2)
              .filter(
                (value) => value !== '--json' && value !== '--no-interactive',
              )
              .join(' '),
        diagnostics.length ? diagnostics : undefined,
      );
      await renderOrFallback(
        [],
        {
          json: argv.includes('--json'),
          interactive: !argv.includes('--no-interactive'),
        },
        process.cwd(),
        [],
        {},
        result,
      );
      exitCode = 2;
    } else {
      const msg = err instanceof Error ? err.message : String(err);
      await renderOrFallback(
        [],
        {
          json: argv.includes('--json'),
          interactive: !argv.includes('--no-interactive'),
        },
        process.cwd(),
        [],
        {},
        createFailureResult(
          [msg],
          1,
          argv.includes('--dry-run'),
          err instanceof Error && 'path' in err && typeof err.path === 'string'
            ? err.path
            : 'request',
          diagnostics.length ? diagnostics : undefined,
        ),
      );
      exitCode = 1;
    }
  }
  if (exitCode !== 0) process.exit(exitCode);
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
