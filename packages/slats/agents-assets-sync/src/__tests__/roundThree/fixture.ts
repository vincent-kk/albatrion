// Shared fixture for the r3-agents-assets-sync probes. Not a test file: the
// Vitest include globs only collect `*.test.*` and `*.spec.*`.
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { vi } from 'vitest';

import { runCli } from '../../index.js';
import type { ConsumerPackage } from '../../types/index.js';

const HERE = dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = resolve(HERE, '../../..');
export const REPO_ROOT = resolve(PACKAGE_ROOT, '../../..');
export const RUNNER = join(HERE, 'runCliChild.ts');
export const TSX_LOADER = join(REPO_ROOT, 'node_modules/tsx/dist/loader.mjs');

export function sha256(body: string | Buffer): string {
  return createHash('sha256').update(body).digest('hex');
}

export function makeRoot(prefix: string): string {
  const root = mkdtempSync(join(tmpdir(), `r3-aas-${prefix}-`));
  // A root marker so --scope=project resolves to this directory.
  mkdirSync(join(root, '.git'));
  return root;
}

export function removeRoot(root: string): void {
  rmSync(root, { recursive: true, force: true });
}

export function writeAt(abs: string, body: string | Buffer): void {
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body);
}

export interface PackageSpec {
  readonly name: string;
  readonly version?: string;
  /** Asset files keyed by path below `docs/agents`. */
  readonly assets: Record<string, string | Buffer>;
  /** `true` writes a manifest matching the assets; a record writes that `files` map. */
  readonly manifest?: true | Record<string, string>;
  /** Raw manifest text, written verbatim (for malformed or partial manifests). */
  readonly manifestText?: string;
}

/** Install a consumer under `<root>/node_modules/<name>` and return its package root. */
export function installPackage(root: string, spec: PackageSpec): string {
  const packageRoot = join(root, 'node_modules', spec.name);
  writeAt(
    join(packageRoot, 'package.json'),
    JSON.stringify({
      name: spec.name,
      version: spec.version ?? '1.0.0',
      agents: { assetPath: 'docs/agents' },
    }),
  );
  for (const [rel, body] of Object.entries(spec.assets))
    writeAt(join(packageRoot, 'docs/agents', rel), body);
  const manifestPath = join(packageRoot, 'dist/agents-hashes.json');
  if (spec.manifestText !== undefined) writeAt(manifestPath, spec.manifestText);
  else if (spec.manifest !== undefined) {
    const files =
      spec.manifest === true
        ? Object.fromEntries(
            Object.entries(spec.assets)
              .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
              .map(([rel, body]) => [rel, sha256(body)]),
          )
        : spec.manifest;
    writeAt(
      manifestPath,
      JSON.stringify({
        schemaVersion: 1,
        package: { name: spec.name, version: spec.version ?? '1.0.0' },
        generatedAt: '2026-01-01T00:00:00.000Z',
        algorithm: 'sha256',
        assetRoot: 'docs/agents',
        files,
        previousVersions: {},
      }),
    );
  }
  return packageRoot;
}

/** The runtime target `toConsumerPackages` would produce for an installed package. */
export function consumerOf(
  packageRoot: string,
  name: string,
  hashSource: 'manifest' | 'directory',
): ConsumerPackage {
  return {
    name,
    version: '1.0.0',
    packageRoot,
    assetRoot: join(packageRoot, 'docs/agents'),
    assetPath: 'docs/agents',
    hashesPresent: hashSource === 'manifest',
    hashSource,
  };
}

class ExitSignal extends Error {
  constructor(readonly code: number) {
    super(`process.exit(${code})`);
  }
}

/**
 * Run the public `runCli` in-process and return the first exit code it asked
 * for (0 when it returned normally). `runCli` re-raises an exit thrown from its
 * action as exit 1, so only the first recorded code is the verdict.
 */
export async function runCliCode(args: readonly string[]): Promise<number> {
  const codes: number[] = [];
  const exit = vi
    .spyOn(process, 'exit')
    .mockImplementation((code?: string | number | null) => {
      codes.push(Number(code ?? 0));
      throw new ExitSignal(Number(code ?? 0));
    });
  const silence = [
    vi.spyOn(console, 'log').mockImplementation(() => {}),
    vi.spyOn(console, 'error').mockImplementation(() => {}),
    vi.spyOn(console, 'warn').mockImplementation(() => {}),
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true),
  ];
  try {
    await runCli(['node', 'inject-agents-settings', ...args]);
  } catch (error) {
    if (!(error instanceof ExitSignal)) throw error;
  } finally {
    exit.mockRestore();
    for (const spy of silence) spy.mockRestore();
  }
  return codes[0] ?? 0;
}
