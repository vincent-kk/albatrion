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
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const BIN_PATH = join(PACKAGE_ROOT, 'bin/inject-agents-settings.mjs');
const PACKAGE = '@periphery-e2e/probe';

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

const countStarts = (content: string) =>
  content.split('AGENTS-ASSETS-SYNC:START:').length - 1;

describe('periphery agents-assets-sync probes (temp dirs only)', () => {
  beforeEach(() => {
    outerRoot = mkdtempSync(join(tmpdir(), 'periphery-aas-'));
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

  it('non-interactive --force lists orphan deletions on stderr', () => {
    writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
    writeAt(join(assetRoot, 'skills/pp/extra.md'), '# extra\n');
    const base = ['--agent=claude', '--scope=project', '--asset-path=agents'];
    expect(run(...base).status).toBe(0);
    rmSync(join(assetRoot, 'skills/pp/extra.md'));

    const forced = run(...base, '--force', '--yes');
    expect(forced.status).toBe(0);
    expect(
      existsSync(join(projectRoot, '.claude/skills/pp/extra.md')),
    ).toBe(false);
    // DETAIL: non-interactive --force writes the diverged AND orphan list to stderr.
    expect(forced.stderr).toContain('skills/pp/extra.md');
  });

  it('a Finder .DS_Store inside an installed skill is not an orphan', () => {
    writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
    const base = ['--agent=claude', '--scope=project', '--asset-path=agents'];
    expect(run(...base).status).toBe(0);
    writeAt(join(projectRoot, '.claude/skills/pp/.DS_Store'), 'finder');
    const second = run(...base);
    expect(second.status).toBe(0);
  });

  it('--dry-run on a diverged install exits 0 as the README exit-code table says', () => {
    writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
    const base = ['--agent=claude', '--scope=project', '--asset-path=agents'];
    expect(run(...base).status).toBe(0);
    writeAt(join(projectRoot, '.claude/skills/pp/SKILL.md'), '# edited\n');
    const dry = run(...base, '--dry-run');
    expect(dry.status).toBe(0);
  });

  it('a CRLF-converted AGENTS.md block is recognized, not duplicated', () => {
    writeAt(join(assetRoot, 'rules/pp-rule.md'), '# rule\n');
    const base = ['--agent=codex', '--scope=project', '--asset-path=agents'];
    expect(run(...base).status).toBe(0);
    const agentsMd = join(projectRoot, 'AGENTS.md');
    const lf = readFileSync(agentsMd, 'utf-8');
    expect(countStarts(lf)).toBe(1);
    // What git core.autocrlf=true produces on checkout.
    writeFileSync(agentsMd, lf.replace(/\n/g, '\r\n'), 'utf-8');

    const second = run(...base);
    expect(second.status).toBe(0);
    expect(countStarts(readFileSync(agentsMd, 'utf-8'))).toBe(1);
  });

  it('a manifest key with inner .. segments cannot write outside the skills root', () => {
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
    const escapeSource = join(assetRoot, escapeKey);
    writeAt(escapeSource, 'escaped\n');
    const hash = (body: string) =>
      createHash('sha256').update(body).digest('hex');
    writeAt(
      join(packageRoot, 'dist/agents-hashes.json'),
      JSON.stringify({
        schemaVersion: 1,
        package: { name: PACKAGE, version: '1.0.0' },
        generatedAt: new Date(0).toISOString(),
        algorithm: 'sha256',
        assetRoot: 'agents',
        files: {
          'skills/pp/SKILL.md': hash('# skill\n'),
          [escapeKey]: hash('escaped\n'),
        },
        previousVersions: {},
      }),
    );
    const escapedDestination = join(projectRoot, '.claude/skills', 'pp/../../../../escaped.md');
    expect(escapedDestination.startsWith(outerRoot)).toBe(true);
    expect(escapedDestination.startsWith(projectRoot)).toBe(false);

    run('--agent=claude', '--scope=project');
    expect(existsSync(escapedDestination)).toBe(false);
  });
});
