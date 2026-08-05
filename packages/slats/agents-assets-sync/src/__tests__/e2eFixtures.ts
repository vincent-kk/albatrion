import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildHashes } from '../../scripts/buildHashes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '../..');

export const BIN_PATH = join(PACKAGE_ROOT, 'bin/inject-agents-settings.mjs');
export const DIST_INDEX = join(PACKAGE_ROOT, 'dist/index.mjs');
export const REPO_ROOT = resolve(PACKAGE_ROOT, '../../..');

/**
 * Why the end-to-end suites cannot be trusted right now, or `null` when they
 * can.
 *
 * They drive the built bin, so `dist/` decides what is actually under test.
 * Absent, they would vanish without saying why; older than `src/`, they would
 * pass against the previous build and report green for code nobody ran. Both
 * answers name themselves so a skipped or failing suite is self-explaining.
 *
 * @returns the reason the suite must not run, or `null` to proceed
 */
export function builtBinBlocker(): string | null {
  const built = mtimeOrNull(DIST_INDEX);
  if (built === null) return 'dist/ is missing — run `yarn build` first';
  const newestSource = newestSourceMtime(join(PACKAGE_ROOT, 'src'));
  if (newestSource > built)
    return 'dist/ is older than src/ — rebuild, or these suites test the previous build';
  return null;
}

function mtimeOrNull(path: string): number | null {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return null;
  }
}

// Verification files never reach the bundle, so a change to one leaves `dist/`
// correct; counting them would demand a rebuild for every test edit.
function newestSourceMtime(root: string): number {
  let newest = 0;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue;
    const abs = join(root, entry.name);
    newest = Math.max(
      newest,
      entry.isDirectory() ? newestSourceMtime(abs) : statSync(abs).mtimeMs,
    );
  }
  return newest;
}

export interface ConsumerFixture {
  /** Installed as `<root>/node_modules/<name>`. */
  readonly name: string;
  /** Written to `agents.assetPath`; omit for a package that declares nothing. */
  readonly assetPath?: string;
  /** Asset-root-relative path → file body. */
  readonly files: Readonly<Record<string, string>>;
  /** Build `dist/agents-hashes.json` for the declared asset path. */
  readonly withManifest?: boolean;
}

/**
 * Install a consumer package under a scratch root.
 *
 * The e2e suites used to point at sibling workspaces, whose
 * `dist/agents-hashes.json` is git-ignored and is not produced by this
 * package's build — so they passed or failed on whatever a developer happened
 * to have built. A fixture written here answers only to this file.
 *
 * @param root - scratch root whose `node_modules` receives the package
 * @param fixture - what the package declares and ships
 * @returns the installed package root
 */
export async function installConsumer(
  root: string,
  fixture: ConsumerFixture,
): Promise<string> {
  const packageRoot = join(root, 'node_modules', ...fixture.name.split('/'));
  const assetRoot = join(packageRoot, fixture.assetPath ?? 'agents');
  mkdirSync(packageRoot, { recursive: true });
  writeFileSync(
    join(packageRoot, 'package.json'),
    JSON.stringify({
      name: fixture.name,
      version: '1.0.0',
      ...(fixture.assetPath
        ? { agents: { assetPath: fixture.assetPath } }
        : {}),
    }),
    'utf-8',
  );
  for (const [relPath, body] of Object.entries(fixture.files)) {
    const abs = join(assetRoot, relPath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, body, 'utf-8');
  }
  if (fixture.withManifest)
    await buildHashes({
      packageRoot,
      packageName: fixture.name,
      packageVersion: '1.0.0',
      assetPath: fixture.assetPath ?? 'agents',
    });
  return packageRoot;
}
