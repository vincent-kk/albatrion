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

let scratchRoot: string;

function runJson(args: readonly string[]) {
  return spawnSync(
    process.execPath,
    [BIN_PATH, ...args, '--json', '--dry-run', '--root', scratchRoot],
    { encoding: 'utf-8', cwd: REPO_ROOT },
  );
}

describe.skipIf(!existsSync(DIST_INDEX))('--json output contract', () => {
  beforeAll(() => {
    scratchRoot = mkdtempSync(join(tmpdir(), 'slats-json-'));
    writeFileSync(join(scratchRoot, 'AGENTS.md'), '', 'utf-8');
    // A package with no `agents.assetPath` and no built manifest, so the
    // `--asset-path` unit below reports through the same document shape.
    const pkgRoot = join(
      scratchRoot,
      'node_modules',
      '@slats-e2e',
      'json-undeclared',
    );
    mkdirSync(join(pkgRoot, 'agents', 'skills', 'json-skill'), {
      recursive: true,
    });
    writeFileSync(
      join(pkgRoot, 'package.json'),
      JSON.stringify({ name: '@slats-e2e/json-undeclared', version: '1.0.0' }),
      'utf-8',
    );
    writeFileSync(
      join(pkgRoot, 'agents', 'skills', 'json-skill', 'SKILL.md'),
      '# JSON Skill\n',
      'utf-8',
    );
  });

  afterAll(() => {
    rmSync(scratchRoot, { recursive: true, force: true });
  });

  it('writes one parseable document and nothing else to stdout', () => {
    const result = runJson([
      '--package',
      '@canard/schema-form',
      '--agent=claude',
      '--scope=project',
    ]);
    expect(result.status).toBe(0);
    // The whole stream must parse — a stray log line would break this, which
    // is the point: stdout belongs to the document alone.
    const report = JSON.parse(result.stdout);
    expect(report.schemaVersion).toBe(1);
    expect(report.tool).toBe('agents-assets-sync');
    expect(report.dryRun).toBe(true);
    expect(report.exitCode).toBe(0);
    expect(report.errors).toEqual([]);
  });

  it('describes one unit per (package, agent) pair', () => {
    const report = JSON.parse(
      runJson([
        '--package',
        '@canard/schema-form',
        '--agent=claude,codex',
        '--scope=project',
      ]).stdout,
    );
    expect(report.units).toHaveLength(2);
    expect(report.units.map((u: { agent: string }) => u.agent)).toEqual([
      'claude',
      'codex',
    ]);
    for (const unit of report.units) {
      expect(unit.package.name).toBe('@canard/schema-form');
      expect(unit.scope).toBe('project');
      expect(unit.projectRoot).toBe(scratchRoot);
      expect(typeof unit.requiresForce).toBe('boolean');
      expect(Array.isArray(unit.actions)).toBe(true);
      expect(Array.isArray(unit.report.created)).toBe(true);
    }
  });

  it('carries each action target so a reader can tell a block from a file', () => {
    const report = JSON.parse(
      runJson([
        '--package',
        '@canard/schema-form',
        '--agent=codex',
        '--scope=project',
      ]).stdout,
    );
    const actions = report.units[0].actions as Array<{
      relPath: string;
      target: { kind: string; fileAbs?: string; blockId?: string };
    }>;
    const rule = actions.find((a) => a.relPath.startsWith('rules/'));
    expect(rule?.target).toEqual({
      kind: 'block',
      fileAbs: join(scratchRoot, 'AGENTS.md'),
      blockId: `@canard/schema-form:${rule?.relPath}`,
    });
    expect(
      actions.find((a) => a.relPath.startsWith('skills/'))?.target.kind,
    ).toBe('file');
  });

  // A directory-sourced target reaches the document through the same path a
  // manifest-sourced one does — no `agents-hashes.json missing` error, and a
  // real plan rather than an empty unit.
  it('plans an --asset-path target without any manifest error', () => {
    const result = runJson([
      '--package',
      '@slats-e2e/json-undeclared',
      '--agent=claude',
      '--scope=project',
      '--asset-path=agents',
    ]);
    expect(result.status).toBe(0);
    const report = JSON.parse(result.stdout);
    expect(report.exitCode).toBe(0);
    expect(report.units).toHaveLength(1);
    const [unit] = report.units;
    expect(unit.error).toBeUndefined();
    expect(unit.actions.map((a: { relPath: string }) => a.relPath)).toEqual([
      'skills/json-skill/SKILL.md',
    ]);
  });

  it('reports a flag error as a document, not as loose text', () => {
    const result = runJson([
      '--package',
      '@canard/schema-form',
      '--agent=gemini',
      '--scope=project',
    ]);
    expect(result.status).toBe(2);
    const report = JSON.parse(result.stdout);
    expect(report.exitCode).toBe(2);
    expect(report.units).toEqual([]);
    expect(report.errors.join(' ')).toContain('gemini');
  });

  it('keeps diagnostics off stdout when the run fails before rendering', () => {
    // An unresolvable package exits inside target resolution, upstream of the
    // renderer. stdout must still stay clean so a parser sees "no document".
    const result = runJson([
      '--package',
      '@does/not-exist',
      '--agent=claude',
      '--scope=project',
    ]);
    expect(result.status).toBe(2);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('@does/not-exist');
  });
});
