import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Command } from 'commander';

import { injectDocs } from '../core/inject.js';
import { isInteractive, isValidScope, type Scope } from '../core/scope.js';
import { discover, type ConsumerPackage } from '../discover.js';
import { confirmForceAsync, selectScopeAsync } from '../prompts/index.js';
import { startHeartbeat } from '../utils/heartbeat.js';
import { logger } from '../utils/logger.js';
import { VERSION } from '../version.js';
import { buildHashesCmd } from './buildHashesCmd.js';
import { listConsumers } from './list.js';

export interface RunCliOptions {
  version?: string;
  /**
   * When set, the package that owns this file becomes the implicit
   * `--package` target. Consumer bin stubs pass `import.meta.url`; slats's
   * own top-level bin omits it so `discover()` returns every consumer.
   */
  invokedFromBin?: string;
}

/**
 * Top-level CLI entry for `@slats/claude-assets-sync`.
 *
 * Consumers' `bin/claude-sync.mjs` is a 3-line re-export stub that calls
 * `runCli(process.argv, { invokedFromBin: import.meta.url })`. The same
 * function also backs slats's own `claude-sync` and legacy
 * `claude-assets-sync` bins (which omit `invokedFromBin`).
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
    .action(async (flags: ListFlags) => {
      await listConsumers({ cwd: flags.root, json: flags.json });
    });

  cmd
    .command('build-hashes [pkgRoot]')
    .description(
      'Generate dist/claude-hashes.json for pkgRoot (default: cwd)',
    )
    .action(async (pkgRoot?: string) => {
      await buildHashesCmd({ packageRoot: pkgRoot ?? process.cwd() });
    });

  cmd
    .command('inject-docs')
    .description('[legacy alias] Same as the default inject command')
    .option('--package <name>')
    .option('--all', 'Inject all discovered consumers', false)
    .option('--scope <scope>')
    .option('--dry-run', 'Preview without writing', false)
    .option('--force', 'Overwrite user modifications', false)
    .option('--root <path>')
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

export interface DefaultFlags {
  package?: string;
  all?: boolean;
  scope?: string;
  dryRun?: boolean;
  force?: boolean;
  root?: string;
  workspaces?: boolean;
}

interface ListFlags {
  json?: boolean;
  root?: string;
}

async function runInject(
  flags: DefaultFlags,
  options: RunCliOptions,
): Promise<void> {
  const originCwd = flags.root ?? process.cwd();

  const all = await discover({
    cwd: originCwd,
    includeWorkspaces: flags.workspaces ?? true,
  });

  if (all.length === 0) {
    logger.error(
      'No consumer packages with claude.assetPath found in this tree.',
    );
    logger.error(
      '  Ensure the target package.json has a `"claude": { "assetPath": "..." }` field.',
    );
    process.exit(1);
  }

  const invokedPackageName = options.invokedFromBin
    ? await resolveInvokedPackageName(options.invokedFromBin)
    : null;
  const cwdPackageName = resolveCwdPackageName(all, originCwd);

  const targets = resolveTargets(all, flags, cwdPackageName, invokedPackageName);
  const scope = await resolveScope(flags.scope);

  for (const target of targets) {
    await injectOne(target, scope, flags, originCwd);
  }
}



export function resolveTargets(
  all: ConsumerPackage[],
  flags: DefaultFlags,
  cwdPackageName: string | null,
  invokedPackageName: string | null,
): ConsumerPackage[] {
  if (flags.all) return all;
  if (flags.package) {
    const match = all.find((p) => p.name === flags.package);
    if (!match) {
      logger.error(`No consumer found with package name "${flags.package}"`);
      logger.error(`  Available: ${all.map((p) => p.name).join(', ')}`);
      process.exit(1);
    }
    return [match];
  }
  if (cwdPackageName) {
    const match = all.find((p) => p.name === cwdPackageName);
    if (match) return [match];
  }
  if (invokedPackageName) {
    const match = all.find((p) => p.name === invokedPackageName);
    if (match) return [match];
  }
  if (all.length === 1) return all;
  logger.error(
    'Multiple consumer packages discovered; specify --package=<name> or --all.',
  );
  logger.error(`  Available: ${all.map((p) => p.name).join(', ')}`);
  process.exit(2);
}

/**
 * Returns the consumer whose `packageRoot` contains `cwd` (including equality).
 * When multiple consumers match (e.g. nested packages), the longest
 * `packageRoot` wins — the deepest owner takes priority.
 */
export function resolveCwdPackageName(
  all: ConsumerPackage[],
  cwd: string,
): string | null {
  let best: ConsumerPackage | null = null;
  for (const pkg of all) {
    if (!isPathInside(cwd, pkg.packageRoot)) continue;
    if (!best || pkg.packageRoot.length > best.packageRoot.length) best = pkg;
  }
  return best ? best.name : null;
}

function isPathInside(child: string, parent: string): boolean {
  if (child === parent) return true;
  const prefix = parent.endsWith('/') ? parent : `${parent}/`;
  return child.startsWith(prefix);
}

async function resolveInvokedPackageName(
  fileUrl: string,
): Promise<string | null> {
  let current: string;
  try {
    current = dirname(fileURLToPath(fileUrl));
  } catch {
    return null;
  }
  while (true) {
    try {
      const raw = await readFile(join(current, 'package.json'), 'utf-8');
      const pkg = JSON.parse(raw) as { name?: string };
      if (typeof pkg.name === 'string' && pkg.name.length > 0) return pkg.name;
    } catch {
      /* not at this level; keep walking up */
    }
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

async function injectOne(
  target: ConsumerPackage,
  scope: Scope,
  flags: DefaultFlags,
  originCwd: string,
): Promise<void> {
  if (!target.hashesPresent) {
    logger.warn(
      `${target.name}: dist/claude-hashes.json missing — run "claude-sync build-hashes" in that package first.`,
    );
    return;
  }

  logger.heading(`${target.name}@${target.version}`);

  const stopHeartbeat = startHeartbeat({
    label: `injecting ${target.name}`,
  });

  try {
    const report = await injectDocs({
      packageName: target.name,
      packageVersion: target.version,
      packageRoot: target.packageRoot,
      assetRoot: target.assetRoot,
      scope,
      originCwd,
      dryRun: flags.dryRun ?? false,
      force: flags.force ?? false,
      confirmForce: async (plan) => {
        const diverged = plan.actions.filter(
          (a) => a.kind === 'warn-diverged',
        );
        const orphans = plan.actions.filter((a) => a.kind === 'warn-orphan');
        return confirmForceAsync(
          diverged.length,
          orphans.length,
          [...diverged, ...orphans].map((a) => a.relPath).slice(0, 3),
        );
      },
    });
    if (report.exitCode !== 0) process.exit(report.exitCode);
  } finally {
    stopHeartbeat();
  }
}

async function resolveScope(flag: string | undefined): Promise<Scope> {
  if (flag) {
    if (!isValidScope(flag)) {
      logger.error(
        `Invalid --scope: ${flag}. Expected user | project | local.`,
      );
      process.exit(2);
    }
    return flag;
  }
  if (!isInteractive()) {
    logger.error('--scope is required in non-interactive environments.');
    logger.error('  Pass --scope=user | --scope=project | --scope=local.');
    process.exit(2);
  }
  return selectScopeAsync();
}
