import { existsSync, readFileSync } from 'node:fs';
import { readFile, realpath, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve as resolvePath, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { logger } from '../../../utils/logger.js';

export interface ResolvedMetadata {
  packageRoot: string;
  packageName: string;
  packageVersion: string;
  assetPath: string;
  /** Which source `assetPath` came from; decides how hashes are obtained. */
  assetPathSource: 'package' | 'flag';
}

export interface ResolvePackageOptions {
  /**
   * When `true`, a package whose asset root cannot be established is warned
   * and the function returns `null` instead of calling `process.exit`. Default
   * `false` preserves the v0.3.0 strict behavior for single-target
   * dispatcher calls.
   */
  skipMissingAsset?: boolean;
  /**
   * `--asset-path`. Replaces `agents.assetPath` entirely: its absence is no
   * longer checked, and the path is validated against this package's root
   * instead.
   */
  assetPathOverride?: string;
  /**
   * Collector for skip reasons. Filling it is the point: a skipped package is
   * only a log line otherwise, and `--json` owes its reader a document that
   * says why nothing resolved. Appended to alongside the warning, never read.
   */
  skipReasons?: string[];
}

// Dispatcher exception to the src/core purity rule: the bin layer is
// allowed to read the package.json of ONE explicitly-named target.
// Never walks node_modules for siblings; sibling enumeration is
// confined to `resolveScopeAlias.ts`.
export async function resolvePackage(
  name: string,
  options: ResolvePackageOptions = {},
  originCwd: string = process.cwd(),
): Promise<ResolvedMetadata | null> {
  const pkgJsonPath = resolvePackageJsonPath(name, originCwd);
  if (!pkgJsonPath) {
    logger.error(
      `cannot resolve package "${name}". Install it in the current project or pass the correct name.`,
    );
    process.exit(2);
  }

  const packageRoot = dirname(pkgJsonPath);
  const raw = await readFile(pkgJsonPath, 'utf-8');
  const pkg = JSON.parse(raw) as {
    name?: unknown;
    version?: unknown;
    agents?: { assetPath?: unknown };
  };

  if (typeof pkg.name !== 'string' || typeof pkg.version !== 'string') {
    if (options.skipMissingAsset) {
      return skip(
        options,
        `"${name}" package.json is missing a string "name" or "version" — skipping.`,
      );
    }
    logger.error(`${pkgJsonPath} must define string "name" and "version".`);
    process.exit(2);
  }

  const override = options.assetPathOverride;
  const declared = pkg.agents?.assetPath;
  const assetPath =
    override ??
    (typeof declared === 'string' && declared.length > 0
      ? declared
      : undefined);

  if (assetPath === undefined) {
    if (options.skipMissingAsset) {
      return skip(
        options,
        `"${name}" is missing "agents.assetPath" — skipping (the package does not ship agent assets).`,
      );
    }
    logger.error(
      `"${name}" is missing "agents.assetPath" in its package.json — the package does not ship agent assets.`,
    );
    process.exit(2);
  }

  const source = override !== undefined ? 'flag' : 'package';
  const label =
    source === 'flag'
      ? `--asset-path "${assetPath}"`
      : `"agents.assetPath": "${assetPath}"`;
  // A flag names a directory the caller asserts is there, so its absence is an
  // error. A declaration is accompanied by a manifest and may legitimately
  // point at a tree the published tarball pruned, so absence stays allowed.
  const verdict = await inspectAssetRoot(packageRoot, assetPath, {
    requireDirectory: source === 'flag',
  });
  if (verdict !== 'ok') {
    const detail =
      verdict === 'escapes'
        ? `resolves outside ${packageRoot}`
        : `is not a directory inside ${packageRoot}`;
    if (options.skipMissingAsset) {
      return skip(options, `"${name}": ${label} ${detail} — skipping.`);
    }
    logger.error(`"${name}": ${label} ${detail}.`);
    process.exit(2);
  }

  return {
    packageRoot,
    packageName: pkg.name,
    packageVersion: pkg.version,
    assetPath,
    assetPathSource: source,
  };
}

// A soft skip is both a diagnostic and a value: the warning keeps the plain
// transcript readable, and the collected reason lets `--json` explain an empty
// run without its reader scraping stderr.
function skip(options: ResolvePackageOptions, reason: string): null {
  logger.warn(reason);
  options.skipReasons?.push(reason);
  return null;
}

/**
 * Judge an asset root against the package that must contain it.
 *
 * Containment is decided on the resolved location, not the spelling: `resolve`
 * is lexical and `stat` follows links, so a symlinked asset root would read as
 * inside the package while pointing anywhere on disk. Every byte this tool
 * injects is read from here and lands in directories an agent reads back as
 * instructions, so the check runs for a declared path and a flag alike.
 *
 * @param packageRoot - absolute package root the asset root must sit under
 * @param relPath - asset root relative to `packageRoot`
 * @param options.requireDirectory - when true, a missing asset root is rejected
 * @returns `ok`, or why the path was refused
 */
async function inspectAssetRoot(
  packageRoot: string,
  relPath: string,
  options: { requireDirectory: boolean },
): Promise<'ok' | 'escapes' | 'not-a-directory'> {
  const abs = resolvePath(packageRoot, relPath);
  if (!isInside(packageRoot, abs)) return 'escapes';

  const real = await realpath(abs).catch(() => null);
  // Nothing at that path: there is no location to escape to, so containment is
  // satisfied and only the caller's own existence requirement can refuse it.
  if (real === null) return options.requireDirectory ? 'not-a-directory' : 'ok';

  const realRoot = await realpath(packageRoot).catch(() => packageRoot);
  if (!isInside(realRoot, real)) return 'escapes';

  const entry = await stat(real).catch(() => null);
  if (entry?.isDirectory()) return 'ok';
  // Containment was settled above, so what is left is only "not a directory".
  // Calling it an escape sends the reader to move a path that is already in
  // the right place.
  return 'not-a-directory';
}

function isInside(root: string, candidate: string): boolean {
  return candidate === root || candidate.startsWith(root + sep);
}

// Two-pass resolution: caller's cwd first (so `npx -p` invocations see
// the host project's node_modules), then engine-rooted (so a globally
// installed engine still resolves bundled deps). Both passes share the
// same fallback for `ERR_PACKAGE_PATH_NOT_EXPORTED`.
function resolvePackageJsonPath(
  name: string,
  originCwd: string,
): string | null {
  const fromCwd = tryResolveFrom(
    name,
    resolvePath(originCwd, '__resolve-base__'),
  );
  if (fromCwd) return fromCwd;

  return tryResolveFrom(name, fileURLToPath(import.meta.url));
}

// Resolve <name>/package.json relative to `baseFilename`. Modern packages
// often lock down `exports` and do not expose `./package.json`, which
// makes the direct subpath resolve throw `ERR_PACKAGE_PATH_NOT_EXPORTED`.
// Fallback path: resolve the package's main entry, then walk up until we
// find the package.json whose `name` matches the requested one.
function tryResolveFrom(name: string, baseFilename: string): string | null {
  const require = createRequire(baseFilename);

  try {
    return require.resolve(`${name}/package.json`);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') return null;
  }

  let mainEntry: string;
  try {
    mainEntry = require.resolve(name);
  } catch {
    return null;
  }

  let dir = dirname(mainEntry);
  while (dir && dir !== dirname(dir)) {
    const candidate = resolvePath(dir, 'package.json');
    if (existsSync(candidate)) {
      try {
        const pkg = JSON.parse(readFileSync(candidate, 'utf-8')) as {
          name?: unknown;
        };
        if (pkg.name === name) return candidate;
      } catch {
        // Malformed package.json in an ancestor dir — keep walking.
      }
    }
    dir = dirname(dir);
  }

  return null;
}
