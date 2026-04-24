import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN_PATH = resolve(__dirname, '../../bin/inject-claude-settings.mjs');
const DIST_INDEX = resolve(__dirname, '../../dist/index.mjs');
const REPO_ROOT = resolve(__dirname, '../../../../..');

// Every CLI invocation runs with `--dry-run` so no file is ever written to
// the target `.claude/` directory. `--scope=project` satisfies the non-TTY
// scope requirement; `--root REPO_ROOT` pins scope resolution to the
// monorepo root so scope-alias enumeration finds `packages/<scope>/*`.
function runCli(packageArgs: readonly string[]) {
  return spawnSync(
    process.execPath,
    [
      BIN_PATH,
      ...packageArgs,
      '--scope=project',
      '--dry-run',
      '--root',
      REPO_ROOT,
    ],
    { encoding: 'utf-8' },
  );
}

// Requires a prior `yarn build` to produce dist/index.mjs. On a fresh
// checkout the suite auto-skips so `yarn test` does not fail before build.
describe.skipIf(!existsSync(DIST_INDEX))(
  'inject-claude-settings CLI (e2e, dry-run)',
  () => {
    it('resolves a single scoped package (v0.3.0 backward compatibility)', () => {
      const result = runCli(['--package', '@canard/schema-form']);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('@canard/schema-form@');
      expect(result.stdout).toContain('[DRY RUN]');
    });

    it('enumerates every asset-bearing package under a scope alias', () => {
      const result = runCli(['--package', '@winglet']);
      expect(result.status).toBe(0);
      for (const name of [
        'common-utils',
        'data-loader',
        'json',
        'json-schema',
        'react-utils',
        'style-utils',
      ]) {
        expect(result.stdout).toContain(`@winglet/${name}@`);
      }
    });

    it('aggregates repeated --package flags', () => {
      const result = runCli([
        '--package',
        '@canard/schema-form',
        '--package',
        '@lerx/promise-modal',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('@canard/schema-form@');
      expect(result.stdout).toContain('@lerx/promise-modal@');
    });

    it('splits comma-separated values into distinct targets', () => {
      const result = runCli([
        '--package',
        '@canard/schema-form,@winglet/common-utils',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('@canard/schema-form@');
      expect(result.stdout).toContain('@winglet/common-utils@');
    });
  },
);
