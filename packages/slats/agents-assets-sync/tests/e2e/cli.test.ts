import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN_PATH = resolve(__dirname, '../../bin/inject-agents-settings.mjs');
const DIST_INDEX = resolve(__dirname, '../../dist/index.mjs');
const REPO_ROOT = resolve(__dirname, '../../../../..');

// Every invocation is --dry-run AND pinned to a scratch root. The pin is
// load-bearing, not belt-and-braces: project scope now anchors on .git and
// AGENTS.md too, so an unpinned run would target this repository's own
// AGENTS.md. The scratch root gets its own AGENTS.md to be that anchor.
let scratchRoot: string;

function runCliFrom(root: string, args: readonly string[]) {
  return spawnSync(
    process.execPath,
    [BIN_PATH, ...args, '--dry-run', '--root', root],
    {
      encoding: 'utf-8',
      cwd: REPO_ROOT,
    },
  );
}

function runCli(args: readonly string[]) {
  return runCliFrom(scratchRoot, args);
}

// `--root` feeds two things at once: scope resolution and the ancestor walk
// that expands a scope alias into installed packages. A scratch root has no
// node_modules, so the alias case has to point at the repository — safe here
// only because --dry-run writes nothing regardless of where the root is.
function runCliFromRepo(args: readonly string[]) {
  return runCliFrom(REPO_ROOT, args);
}

describe.skipIf(!existsSync(DIST_INDEX))(
  'inject-agents-settings CLI (e2e, dry-run)',
  () => {
    beforeAll(() => {
      scratchRoot = mkdtempSync(join(tmpdir(), 'slats-e2e-'));
      writeFileSync(join(scratchRoot, 'AGENTS.md'), '', 'utf-8');
    });

    afterAll(() => {
      rmSync(scratchRoot, { recursive: true, force: true });
    });

    it('injects one package for claude', () => {
      const result = runCli([
        '--package',
        '@canard/schema-form',
        '--agent=claude',
        '--scope=project',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('@canard/schema-form@');
      expect(result.stdout).toContain('· claude');
      expect(result.stdout).toContain('[DRY RUN]');
    });

    // At project scope codex and agents share the `.agents` layout; they
    // differ only at user scope, which a dry-run here cannot exercise
    // without pointing at the real home directory.
    it.each(['codex', 'agents'] as const)(
      'routes %s rules into AGENTS.md and skills into .agents',
      (agent) => {
        const result = runCli([
          '--package',
          '@canard/schema-form',
          `--agent=${agent}`,
          '--scope=project',
        ]);
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('AGENTS.md ▸ rules/schema-form-rule.md');
        expect(result.stdout).toContain(join(scratchRoot, '.agents', 'skills'));
      },
    );

    it('plans every selected agent in one run', () => {
      const result = runCli([
        '--package',
        '@canard/schema-form',
        '--agent=claude,codex,agents',
        '--scope=project',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('· claude');
      expect(result.stdout).toContain('· codex');
      expect(result.stdout).toContain('· agents');
    });

    it('enumerates every asset-bearing package under a scope alias', () => {
      const result = runCliFromRepo([
        '--package',
        '@winglet',
        '--agent=codex',
        '--scope=project',
      ]);
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

    it('leaves AGENTS.md out of the plan when --asset=skills', () => {
      const result = runCli([
        '--package',
        '@canard/schema-form',
        '--agent=codex',
        '--asset=skills',
        '--scope=project',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('skills/schema-form-skill/SKILL.md');
      expect(result.stdout).not.toContain('AGENTS.md ▸');
    });

    it.each([
      [
        'missing --agent',
        ['--package', '@canard/schema-form', '--scope=project'],
      ],
      [
        'unknown agent',
        [
          '--package',
          '@canard/schema-form',
          '--agent=gemini',
          '--scope=project',
        ],
      ],
      [
        'unknown asset kind',
        [
          '--package',
          '@canard/schema-form',
          '--agent=claude',
          '--asset=prompts',
          '--scope=project',
        ],
      ],
      [
        'missing --scope',
        ['--package', '@canard/schema-form', '--agent=claude'],
      ],
      ['missing --package', ['--agent=claude', '--scope=project']],
      [
        'unresolvable package',
        ['--package', '@does/not-exist', '--agent=claude', '--scope=project'],
      ],
    ])('exits 2 on %s', (_label, args) => {
      expect(runCli(args).status).toBe(2);
    });
  },
);
