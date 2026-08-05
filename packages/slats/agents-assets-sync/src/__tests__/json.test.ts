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

const DECLARED = '@slats-e2e/declared';
const UNDECLARED = '@slats-e2e/json-undeclared';
const EMPTY_SCOPE = '@slats-e2e-empty';

const blocker = builtBinBlocker();

let scratchRoot: string;

function runJson(args: readonly string[]) {
  return spawnSync(
    process.execPath,
    [BIN_PATH, ...args, '--json', '--dry-run', '--root', scratchRoot],
    { encoding: 'utf-8', cwd: REPO_ROOT },
  );
}

describe.skipIf(blocker !== null)(
  `--json output contract${blocker ? ` — SKIPPED: ${blocker}` : ''}`,
  () => {
    beforeAll(async () => {
      scratchRoot = mkdtempSync(join(tmpdir(), 'slats-json-'));
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
        files: { 'skills/json-skill/SKILL.md': '# JSON Skill\n' },
      });
      // A scope where nothing survives the `--asset-path` filter, so the run
      // reaches the renderer with no targets at all.
      for (const name of ['a', 'b'])
        await installConsumer(scratchRoot, {
          name: `${EMPTY_SCOPE}/${name}`,
          files: {},
        });
    });

    afterAll(() => {
      rmSync(scratchRoot, { recursive: true, force: true });
    });

    it('writes one parseable document and nothing else to stdout', () => {
      const result = runJson([
        '--package',
        DECLARED,
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
          DECLARED,
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
        expect(unit.package.name).toBe(DECLARED);
        expect(unit.scope).toBe('project');
        expect(unit.projectRoot).toBe(scratchRoot);
        expect(typeof unit.requiresForce).toBe('boolean');
        expect(Array.isArray(unit.actions)).toBe(true);
        expect(Array.isArray(unit.report.created)).toBe(true);
      }
    });

    it('carries each action target so a reader can tell a block from a file', () => {
      const report = JSON.parse(
        runJson(['--package', DECLARED, '--agent=codex', '--scope=project'])
          .stdout,
      );
      const actions = report.units[0].actions as Array<{
        relPath: string;
        target: { kind: string; fileAbs?: string; blockId?: string };
      }>;
      const rule = actions.find((a) => a.relPath.startsWith('rules/'));
      expect(rule?.target).toEqual({
        kind: 'block',
        fileAbs: join(scratchRoot, 'AGENTS.md'),
        blockId: `${DECLARED}:${rule?.relPath}`,
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
        UNDECLARED,
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

    // "Nothing resolved" is a successful run that did nothing, not a failure —
    // but a reader must still get a document, or it cannot tell success from a
    // parse error. The skip reasons ride along so stderr need not be scraped.
    it('still emits a document when every target is skipped', () => {
      const result = runJson([
        '--package',
        EMPTY_SCOPE,
        '--agent=claude',
        '--scope=project',
        '--asset-path=agents',
      ]);
      expect(result.status).toBe(0);
      const report = JSON.parse(result.stdout);
      expect(report.exitCode).toBe(0);
      expect(report.units).toEqual([]);
      expect(report.errors.join(' ')).toContain(`${EMPTY_SCOPE}/a`);
      expect(report.errors.join(' ')).toContain(`${EMPTY_SCOPE}/b`);
    });

    it('reports a flag error as a document, not as loose text', () => {
      const result = runJson([
        '--package',
        DECLARED,
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
  },
);
