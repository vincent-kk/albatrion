import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BIN_PATH, builtBinBlocker } from './e2eFixtures.js';

const blocker = builtBinBlocker();

const PACKAGE = '@slats-e2e/apply-safety';
const BASE = ['--agent=claude', '--scope=project', '--asset-path=agents'];

// Every run writes for real, inside `outerRoot`. The project sits one level
// below it so a write that escapes the project is still observable and still
// cleaned up.
let outerRoot: string;
let projectRoot: string;
let packageRoot: string;
let assetRoot: string;

function writeAt(abs: string, body: string): void {
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body, 'utf-8');
}

function run(...args: readonly string[]) {
  return spawnSync(
    process.execPath,
    [BIN_PATH, '--package', PACKAGE, '--root', projectRoot, ...args],
    { encoding: 'utf-8', cwd: projectRoot },
  );
}

const sha256 = (body: string) =>
  createHash('sha256').update(body).digest('hex');

const countStarts = (content: string) =>
  content.split('AGENTS-ASSETS-SYNC:START:').length - 1;

describe.skipIf(blocker !== null)(
  `inject-agents-settings CLI (e2e, apply safety)${blocker ? ` — SKIPPED: ${blocker}` : ''}`,
  () => {
    beforeEach(() => {
      outerRoot = mkdtempSync(join(tmpdir(), 'slats-e2e-safety-'));
      projectRoot = join(outerRoot, 'project');
      mkdirSync(projectRoot, { recursive: true });
      writeFileSync(join(projectRoot, 'AGENTS.md'), '# Project\n', 'utf-8');
      packageRoot = join(projectRoot, 'node_modules', ...PACKAGE.split('/'));
      assetRoot = join(packageRoot, 'agents');
      writeAt(
        join(packageRoot, 'package.json'),
        JSON.stringify({ name: PACKAGE, version: '1.0.0' }),
      );
    });

    afterEach(() => {
      rmSync(outerRoot, { recursive: true, force: true });
    });

    it('never writes outside the skills root for a manifest key with inner .. segments', () => {
      writeAt(
        join(packageRoot, 'package.json'),
        JSON.stringify({
          name: PACKAGE,
          version: '1.0.0',
          agents: { assetPath: 'agents' },
        }),
      );
      writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
      const escapeKey = 'skills/pp/../../../../escaped.md';
      writeAt(join(assetRoot, escapeKey), 'escaped\n');
      writeAt(
        join(packageRoot, 'dist/agents-hashes.json'),
        JSON.stringify({
          schemaVersion: 1,
          package: { name: PACKAGE, version: '1.0.0' },
          generatedAt: new Date(0).toISOString(),
          algorithm: 'sha256',
          assetRoot: 'agents',
          files: {
            'skills/pp/SKILL.md': sha256('# skill\n'),
            [escapeKey]: sha256('escaped\n'),
          },
          previousVersions: {},
        }),
      );
      const escaped = join(
        projectRoot,
        '.claude/skills',
        'pp/../../../../escaped.md',
      );
      expect(escaped.startsWith(projectRoot)).toBe(false);

      const result = run('--agent=claude', '--scope=project', '--force');

      expect(existsSync(escaped)).toBe(false);
      expect(result.status).not.toBe(0);
      // The plain renderer reports a unit's error through the logger (stdout).
      expect(`${result.stdout}${result.stderr}`).toContain(escapeKey);
    });

    it('lists orphan deletions on stderr in a non-interactive --force run', () => {
      writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
      writeAt(join(assetRoot, 'skills/pp/extra.md'), '# extra\n');
      expect(run(...BASE).status).toBe(0);
      rmSync(join(assetRoot, 'skills/pp/extra.md'));

      const forced = run(...BASE, '--force', '--yes');

      expect(forced.status).toBe(0);
      expect(existsSync(join(projectRoot, '.claude/skills/pp/extra.md'))).toBe(
        false,
      );
      expect(forced.stderr).toContain('skills/pp/extra.md');
    });

    it('recognizes a CRLF-converted AGENTS.md block instead of appending a duplicate', () => {
      writeAt(join(assetRoot, 'rules/pp-rule.md'), '# rule\n');
      const codex = ['--agent=codex', '--scope=project', '--asset-path=agents'];
      expect(run(...codex).status).toBe(0);
      const agentsMd = join(projectRoot, 'AGENTS.md');
      const lf = readFileSync(agentsMd, 'utf-8');
      expect(countStarts(lf)).toBe(1);
      // What a `core.autocrlf=true` checkout produces.
      writeFileSync(agentsMd, lf.replace(/\n/g, '\r\n'), 'utf-8');

      const second = run(...codex);

      expect(countStarts(readFileSync(agentsMd, 'utf-8'))).toBe(1);
      expect(second.status).toBe(0);
    });

    it('does not treat a Finder .DS_Store inside an installed skill as an orphan', () => {
      writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
      expect(run(...BASE).status).toBe(0);
      const dsStore = join(projectRoot, '.claude/skills/pp/.DS_Store');
      writeAt(dsStore, 'finder');

      expect(run(...BASE).status).toBe(0);
      expect(run(...BASE, '--force', '--yes').status).toBe(0);
      expect(existsSync(dsStore)).toBe(true);
    });

    it.each([[[]], [['--json']]])(
      'exits 0 for --dry-run on a diverged install (extra flags: %j)',
      (extra) => {
        writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
        expect(run(...BASE).status).toBe(0);
        const installed = join(projectRoot, '.claude/skills/pp/SKILL.md');
        writeAt(installed, '# edited\n');

        const dry = run(...BASE, '--dry-run', ...extra);

        expect(dry.status).toBe(0);
        expect(readFileSync(installed, 'utf-8')).toBe('# edited\n');
      },
    );
  },
);
