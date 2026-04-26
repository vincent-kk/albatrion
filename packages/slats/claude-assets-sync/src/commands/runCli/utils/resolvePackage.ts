import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import { logger } from '../../../utils/logger.js';

export interface ResolvedMetadata {
  packageRoot: string;
  packageName: string;
  packageVersion: string;
  assetPath: string;
}

export interface ResolvePackageOptions {
  /**
   * When `true`, a package without `claude.assetPath` is warned and the
   * function returns `null` instead of calling `process.exit`. Default
   * `false` preserves the v0.3.0 strict behavior for single-target
   * dispatcher calls.
   */
  skipMissingAsset?: boolean;
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
    claude?: { assetPath?: unknown };
  };

  if (typeof pkg.name !== 'string' || typeof pkg.version !== 'string') {
    if (options.skipMissingAsset) {
      logger.warn(
        `"${name}" package.json is missing a string "name" or "version" — skipping.`,
      );
      return null;
    }
    logger.error(`${pkgJsonPath} must define string "name" and "version".`);
    process.exit(2);
  }

  const assetPath = pkg.claude?.assetPath;
  if (typeof assetPath !== 'string' || assetPath.length === 0) {
    if (options.skipMissingAsset) {
      logger.warn(
        `"${name}" is missing "claude.assetPath" — skipping (the package does not ship Claude assets).`,
      );
      return null;
    }
    logger.error(
      `"${name}" is missing "claude.assetPath" in its package.json — the package does not ship Claude assets.`,
    );
    process.exit(2);
  }

  return {
    packageRoot,
    packageName: pkg.name,
    packageVersion: pkg.version,
    assetPath,
  };
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
