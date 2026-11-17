import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BIN_PATH, builtBinBlocker } from './e2eFixtures.js';

const blocker = builtBinBlocker();

const PACKAGE = '@slats-e2e/symlinked-destination';
const SKILL_BODY = '# skill\n';

// Every run writes for real. The project, the fake home and the directory a
// symlink points at all sit under `outerRoot`, so an escaped write is both
// observable and cleaned up, and no run touches the real home directory.
let outerRoot: string;
let projectRoot: string;
let outside: string;

function writeAt(abs: string, body: string): void {
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body, 'utf-8');
}

function run(scope: 'project' | 'user', ...extra: readonly string[]) {
  return spawnSync(
    process.execPath,
    [
      BIN_PATH,
      '--package',
      PACKAGE,
      '--root',
      projectRoot,
      '--agent=claude',
      `--scope=${scope}`,
      '--asset-path=agents',
      ...extra,
    ],
    {
      encoding: 'utf-8',
      cwd: projectRoot,
      env: { ...process.env, HOME: join(outerRoot, 'home') },
    },
  );
}

describe.skipIf(blocker !== null)(
  `inject-agents-settings CLI (e2e, symlinked destinations)${blocker ? ` — SKIPPED: ${blocker}` : ''}`,
  () => {
    beforeEach(() => {
      outerRoot = mkdtempSync(join(tmpdir(), 'slats-e2e-symlink-'));
      projectRoot = join(outerRoot, 'project');
      outside = join(outerRoot, 'outside');
      mkdirSync(outside, { recursive: true });
      writeAt(join(projectRoot, 'AGENTS.md'), '# Project\n');
      const packageRoot = join(projectRoot, 'node_modules', PACKAGE);
      writeAt(
        join(packageRoot, 'package.json'),
        JSON.stringify({ name: PACKAGE, version: '1.0.0' }),
      );
      writeAt(join(packageRoot, 'agents/skills/pp/SKILL.md'), SKILL_BODY);
    });

    afterEach(() => {
      rmSync(outerRoot, { recursive: true, force: true });
    });

    it('refuses a project skills root that is a symlink to a directory outside the project', () => {
      const skillsRoot = join(projectRoot, '.claude/skills');
      mkdirSync(dirname(skillsRoot), { recursive: true });
      symlinkSync(outside, skillsRoot, 'dir');

      const result = run('project');

      expect(existsSync(join(outside, 'pp/SKILL.md'))).toBe(false);
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toContain(skillsRoot);
    });

    it('refuses a skill namespace that is a symlink outside the project, and deletes nothing there', () => {
      const victim = join(outside, 'victim.md');
      writeAt(victim, 'keep me\n');
      const namespace = join(projectRoot, '.claude/skills/pp');
      mkdirSync(dirname(namespace), { recursive: true });
      symlinkSync(outside, namespace, 'dir');

      const result = run('project', '--force', '--yes');

      expect(existsSync(victim)).toBe(true);
      expect(existsSync(join(outside, 'SKILL.md'))).toBe(false);
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toContain(namespace);
    });

    // Control: at user scope a symlinked `~/.claude/skills` is a deliberate
    // dotfiles setup, so the run installs through it.
    it('control: installs through a symlinked skills root at user scope', () => {
      const dotfiles = join(outerRoot, 'dotfiles/skills');
      mkdirSync(dotfiles, { recursive: true });
      const homeSkills = join(outerRoot, 'home/.claude/skills');
      mkdirSync(dirname(homeSkills), { recursive: true });
      symlinkSync(dotfiles, homeSkills, 'dir');

      const result = run('user');

      expect(result.status).toBe(0);
      expect(readFileSync(join(dotfiles, 'pp/SKILL.md'), 'utf-8')).toBe(
        SKILL_BODY,
      );
    });
  },
);
