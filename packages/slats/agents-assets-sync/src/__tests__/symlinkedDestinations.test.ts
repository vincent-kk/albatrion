import { spawnSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
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
let packageRoot: string;

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
      packageRoot = join(projectRoot, 'node_modules', PACKAGE);
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

    it('refuses to overwrite through a file link at a copied path that points outside the project', () => {
      const target = join(outside, 'target.md');
      writeAt(target, 'outside\n');
      const installed = join(projectRoot, '.claude/skills/pp/SKILL.md');
      mkdirSync(dirname(installed), { recursive: true });
      symlinkSync(target, installed, 'file');

      const result = run('project', '--force', '--yes');

      expect(readFileSync(target, 'utf-8')).toBe('outside\n');
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toContain(installed);
    });

    it('refuses to copy through a directory link below a skill namespace that points outside the project', () => {
      writeAt(join(packageRoot, 'agents/skills/pp/knowledge/a.md'), '# a\n');
      const knowledge = join(projectRoot, '.claude/skills/pp/knowledge');
      mkdirSync(dirname(knowledge), { recursive: true });
      symlinkSync(outside, knowledge, 'dir');

      const result = run('project');

      expect(existsSync(join(outside, 'a.md'))).toBe(false);
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toContain(knowledge);
    });

    // Control: the orphan scan never follows links, so a --force run deletes
    // nothing through them; it touches neither the links nor their targets
    // and has nothing to refuse.
    it('control: a --force run leaves orphan links and their outside targets alone', () => {
      const victim = join(outside, 'victim.md');
      writeAt(victim, 'keep\n');
      const deep = join(outerRoot, 'outside-dir');
      writeAt(join(deep, 'victim.md'), 'keep\n');
      const namespace = join(projectRoot, '.claude/skills/pp');
      mkdirSync(namespace, { recursive: true });
      symlinkSync(victim, join(namespace, 'old.md'), 'file');
      symlinkSync(deep, join(namespace, 'knowledge'), 'dir');

      const result = run('project', '--force', '--yes');

      expect(result.status).toBe(0);
      expect(readFileSync(victim, 'utf-8')).toBe('keep\n');
      expect(readFileSync(join(deep, 'victim.md'), 'utf-8')).toBe('keep\n');
      expect(lstatSync(join(namespace, 'old.md')).isSymbolicLink()).toBe(true);
      expect(lstatSync(join(namespace, 'knowledge')).isSymbolicLink()).toBe(
        true,
      );
    });

    // Control: a link that stays inside the project is allowed, as it is for
    // a destination root.
    it('control: installs through a directory link below a namespace that stays inside the project', () => {
      writeAt(join(packageRoot, 'agents/skills/pp/knowledge/a.md'), '# a\n');
      const shared = join(projectRoot, 'shared/knowledge');
      mkdirSync(shared, { recursive: true });
      const knowledge = join(projectRoot, '.claude/skills/pp/knowledge');
      mkdirSync(dirname(knowledge), { recursive: true });
      symlinkSync(shared, knowledge, 'dir');

      const result = run('project');

      expect(result.status).toBe(0);
      expect(readFileSync(join(shared, 'a.md'), 'utf-8')).toBe('# a\n');
    });

    // Control: at user scope a file link to a dotfiles copy is followed.
    it('control: overwrites through a file link at user scope', () => {
      const dotfile = join(outerRoot, 'dotfiles/SKILL.md');
      writeAt(dotfile, 'old\n');
      const installed = join(outerRoot, 'home/.claude/skills/pp/SKILL.md');
      mkdirSync(dirname(installed), { recursive: true });
      symlinkSync(dotfile, installed, 'file');

      const result = run('user', '--force', '--yes');

      expect(result.status).toBe(0);
      expect(readFileSync(dotfile, 'utf-8')).toBe(SKILL_BODY);
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
