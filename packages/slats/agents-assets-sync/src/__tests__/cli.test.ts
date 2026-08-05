import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
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

// The case `--asset-path` exists for: assets sitting in a directory with no
// `agents.assetPath` declaration and no `dist/agents-hashes.json` to read.
// Installed under the scratch root's node_modules so `--root` resolves it.
const UNDECLARED = '@slats-e2e/no-declaration';

function installUndeclaredFixture(): void {
  const pkgRoot = join(scratchRoot, 'node_modules', ...UNDECLARED.split('/'));
  const skillDir = join(pkgRoot, 'agents', 'skills', 'e2e-skill');
  mkdirSync(skillDir, { recursive: true });
  mkdirSync(join(pkgRoot, 'agents', 'rules'), { recursive: true });
  writeFileSync(
    join(pkgRoot, 'package.json'),
    JSON.stringify({ name: UNDECLARED, version: '0.0.0' }),
    'utf-8',
  );
  writeFileSync(join(skillDir, 'SKILL.md'), '# E2E Skill\n', 'utf-8');
  writeFileSync(
    join(pkgRoot, 'agents', 'rules', 'e2e-rule.md'),
    '# E2E Rule\n',
    'utf-8',
  );
}

// A scope holding one package with an `agents/` tree and one without, so the
// alias run below shows which of the two the override keeps.
const ALIAS_SCOPE = '@slats-e2e-scope';

function installScopeFixture(): void {
  for (const [name, hasAssets] of [
    ['with-assets', true],
    ['without-assets', false],
  ] as const) {
    const pkgRoot = join(scratchRoot, 'node_modules', ALIAS_SCOPE, name);
    mkdirSync(pkgRoot, { recursive: true });
    writeFileSync(
      join(pkgRoot, 'package.json'),
      JSON.stringify({ name: `${ALIAS_SCOPE}/${name}`, version: '0.0.0' }),
      'utf-8',
    );
    if (!hasAssets) continue;
    const skillDir = join(pkgRoot, 'agents', 'skills', `${name}-skill`);
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, 'SKILL.md'), `# ${name}\n`, 'utf-8');
  }
}

describe.skipIf(!existsSync(DIST_INDEX))(
  'inject-agents-settings CLI (e2e, dry-run)',
  () => {
    beforeAll(() => {
      scratchRoot = mkdtempSync(join(tmpdir(), 'slats-e2e-'));
      writeFileSync(join(scratchRoot, 'AGENTS.md'), '', 'utf-8');
      installUndeclaredFixture();
      installScopeFixture();
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
        expect(result.stdout).toContain(
          'AGENTS.md ▸ rules/schema-form-rule.md',
        );
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

    it('injects a package that declares no asset path and ships no manifest', () => {
      const result = runCli([
        '--package',
        UNDECLARED,
        '--agent=claude',
        '--scope=project',
        '--asset-path=agents',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('skills/e2e-skill/SKILL.md');
      expect(result.stderr).not.toContain('agents-hashes.json');
    });

    // Without the flag the same package still fails the old way — the
    // declaration requirement is relaxed by `--asset-path`, not removed.
    it('still exits 2 on that package without --asset-path', () => {
      expect(
        runCli(['--package', UNDECLARED, '--agent=claude', '--scope=project'])
          .status,
      ).toBe(2);
    });

    // With an override every enumerated package gets the same asset path, so
    // what filters the scope stops being the declaration and becomes whether
    // that directory exists in each package.
    it('filters a scope alias by directory existence under --asset-path', () => {
      const result = runCli([
        '--package',
        ALIAS_SCOPE,
        '--agent=claude',
        '--scope=project',
        '--asset-path=agents',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`${ALIAS_SCOPE}/with-assets@`);
      expect(result.stdout).not.toContain(`${ALIAS_SCOPE}/without-assets@`);
      expect(result.stdout).toContain('skills/with-assets-skill/SKILL.md');
    });

    it('keeps --asset and --asset-path from swallowing each other', () => {
      const result = runCli([
        '--package',
        UNDECLARED,
        '--agent=codex',
        '--asset=skills',
        '--asset-path=agents',
        '--scope=project',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('skills/e2e-skill/SKILL.md');
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
      [
        'absolute --asset-path',
        [
          '--package',
          '@canard/schema-form',
          '--agent=claude',
          '--scope=project',
          '--asset-path=/etc/agents',
        ],
      ],
    ])('exits 2 on %s', (_label, args) => {
      expect(runCli(args).status).toBe(2);
    });
  },
);
