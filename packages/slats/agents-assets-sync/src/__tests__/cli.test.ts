import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  BIN_PATH,
  REPO_ROOT,
  builtBinBlocker,
  installConsumer,
} from './e2eFixtures.js';

// Every invocation is --dry-run AND pinned to a scratch root. The pin is
// load-bearing, not belt-and-braces: project scope now anchors on .git and
// AGENTS.md too, so an unpinned run would target this repository's own
// AGENTS.md. The scratch root gets its own AGENTS.md to be that anchor.
let scratchRoot: string;

function runCli(args: readonly string[]) {
  return spawnSync(
    process.execPath,
    [BIN_PATH, ...args, '--dry-run', '--root', scratchRoot],
    { encoding: 'utf-8', cwd: REPO_ROOT },
  );
}

// A package that ships the whole convention: a declaration and a built
// manifest. Installed here rather than borrowed from a sibling workspace, so
// the suite answers to this file alone.
const DECLARED = '@slats-e2e/declared';
// The case `--asset-path` exists for: assets in a directory with no
// `agents.assetPath` declaration and no `dist/agents-hashes.json` to read.
const UNDECLARED = '@slats-e2e/no-declaration';
// One scope holding a declared package, an undeclared one, and one with no
// assets at all — enough to show what each enumeration keeps.
const SCOPE = '@slats-e2e-scope';

const blocker = builtBinBlocker();

describe.skipIf(blocker !== null)(
  `inject-agents-settings CLI (e2e, dry-run)${blocker ? ` — SKIPPED: ${blocker}` : ''}`,
  () => {
    beforeAll(async () => {
      scratchRoot = mkdtempSync(join(tmpdir(), 'slats-e2e-'));
      writeFileSync(join(scratchRoot, 'AGENTS.md'), '', 'utf-8');
      await installConsumer(scratchRoot, {
        name: DECLARED,
        assetPath: 'docs/agents',
        withManifest: true,
        files: {
          'skills/declared-skill/SKILL.md': '# Declared Skill\n',
          'rules/declared-rule.md': '# Declared Rule\n',
        },
      });
      await installConsumer(scratchRoot, {
        name: UNDECLARED,
        files: {
          'skills/e2e-skill/SKILL.md': '# E2E Skill\n',
          'rules/e2e-rule.md': '# E2E Rule\n',
        },
      });
      await installConsumer(scratchRoot, {
        name: `${SCOPE}/declared`,
        assetPath: 'docs/agents',
        withManifest: true,
        files: { 'skills/scope-declared/SKILL.md': '# Scope Declared\n' },
      });
      await installConsumer(scratchRoot, {
        name: `${SCOPE}/with-assets`,
        files: { 'skills/with-assets-skill/SKILL.md': '# With Assets\n' },
      });
      await installConsumer(scratchRoot, {
        name: `${SCOPE}/without-assets`,
        files: {},
      });
    });

    afterAll(() => {
      rmSync(scratchRoot, { recursive: true, force: true });
    });

    it('injects one package for claude', () => {
      const result = runCli([
        '--package',
        DECLARED,
        '--agent=claude',
        '--scope=project',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`${DECLARED}@`);
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
          DECLARED,
          `--agent=${agent}`,
          '--scope=project',
        ]);
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('AGENTS.md ▸ rules/declared-rule.md');
        expect(result.stdout).toContain(join(scratchRoot, '.agents', 'skills'));
      },
    );

    it('plans every selected agent in one run', () => {
      const result = runCli([
        '--package',
        DECLARED,
        '--agent=claude,codex,agents',
        '--scope=project',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('· claude');
      expect(result.stdout).toContain('· codex');
      expect(result.stdout).toContain('· agents');
    });

    it('enumerates every asset-bearing package under a scope alias', () => {
      const result = runCli([
        '--package',
        SCOPE,
        '--agent=codex',
        '--scope=project',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`${SCOPE}/declared@`);
      // Declaring nothing is normal inside a scope, so those are skipped
      // rather than failing the batch.
      expect(result.stdout).not.toContain(`${SCOPE}/with-assets@`);
      expect(result.stdout).not.toContain(`${SCOPE}/without-assets@`);
    });

    it('leaves AGENTS.md out of the plan when --asset=skills', () => {
      const result = runCli([
        '--package',
        DECLARED,
        '--agent=codex',
        '--asset=skills',
        '--scope=project',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('skills/declared-skill/SKILL.md');
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
        SCOPE,
        '--agent=claude',
        '--scope=project',
        '--asset-path=agents',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`${SCOPE}/with-assets@`);
      expect(result.stdout).not.toContain(`${SCOPE}/without-assets@`);
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
      ['missing --agent', ['--package', DECLARED, '--scope=project']],
      [
        'unknown agent',
        ['--package', DECLARED, '--agent=gemini', '--scope=project'],
      ],
      [
        'unknown asset kind',
        [
          '--package',
          DECLARED,
          '--agent=claude',
          '--asset=prompts',
          '--scope=project',
        ],
      ],
      ['missing --scope', ['--package', DECLARED, '--agent=claude']],
      ['missing --package', ['--agent=claude', '--scope=project']],
      [
        'unresolvable package',
        ['--package', '@does/not-exist', '--agent=claude', '--scope=project'],
      ],
      [
        'absolute --asset-path',
        [
          '--package',
          DECLARED,
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
