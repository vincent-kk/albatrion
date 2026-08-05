import { spawnSync } from 'node:child_process';
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN_PATH = resolve(__dirname, '../../bin/inject-agents-settings.mjs');
const DIST_INDEX = resolve(__dirname, '../../dist/index.mjs');
const REPO_ROOT = resolve(__dirname, '../../../../..');

const PACKAGE = '@slats-e2e/round-trip';
const SKILL_REL = 'skills/rt-skill/SKILL.md';
const RULE_REL = 'rules/rt-rule.md';
const SKILL_BODY = '# RT Skill\n';
const RULE_BODY = '# RT Rule\n';

// Unlike the dry-run suite in `cli.test.ts`, every run here writes for real.
// That is the point: `--asset-path` replaces the built manifest with one
// computed from the directory, and only an applying run shows that the
// substitute drives copy / skip / diverge / force identically. Writes stay
// inside a scratch root, so `--root` is load-bearing, not belt-and-braces.
let scratchRoot: string;
let assetRoot: string;

function run(...args: readonly string[]) {
  return spawnSync(
    process.execPath,
    [BIN_PATH, '--package', PACKAGE, '--root', scratchRoot, ...args],
    { encoding: 'utf-8', cwd: REPO_ROOT },
  );
}

/** Run the canonical claude/project injection for the fixture package. */
function inject(...extra: readonly string[]) {
  return run(
    '--agent=claude',
    '--scope=project',
    '--asset-path=agents',
    ...extra,
  );
}

function writeFileAt(abs: string, body: string): void {
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body, 'utf-8');
}

/** Where claude/project keeps each kind, per the destination table. */
const installed = {
  skill: () => join(scratchRoot, '.claude', 'skills', 'rt-skill', 'SKILL.md'),
  rule: () => join(scratchRoot, '.claude', 'rules', 'rt-rule.md'),
  agentsMd: () => join(scratchRoot, 'AGENTS.md'),
  codexSkill: () =>
    join(scratchRoot, '.agents', 'skills', 'rt-skill', 'SKILL.md'),
};

describe.skipIf(!existsSync(DIST_INDEX))(
  '--asset-path round trip (e2e, writes)',
  () => {
    beforeEach(() => {
      scratchRoot = mkdtempSync(join(tmpdir(), 'slats-roundtrip-'));
      writeFileSync(installed.agentsMd(), '', 'utf-8');
      // A package that declares no `agents.assetPath` and ships no
      // `dist/agents-hashes.json` — exactly what the flag exists for.
      const packageRoot = join(
        scratchRoot,
        'node_modules',
        ...PACKAGE.split('/'),
      );
      assetRoot = join(packageRoot, 'agents');
      writeFileAt(
        join(packageRoot, 'package.json'),
        JSON.stringify({ name: PACKAGE, version: '1.0.0' }),
      );
      writeFileAt(join(assetRoot, SKILL_REL), SKILL_BODY);
      writeFileAt(join(assetRoot, RULE_REL), RULE_BODY);
    });

    afterEach(() => {
      rmSync(scratchRoot, { recursive: true, force: true });
    });

    it('copies every asset from the named directory on the first run', () => {
      const result = inject();

      expect(result.status).toBe(0);
      expect(readFileSync(installed.skill(), 'utf-8')).toBe(SKILL_BODY);
      expect(readFileSync(installed.rule(), 'utf-8')).toBe(RULE_BODY);
      expect(result.stderr).not.toContain('agents-hashes.json');
    });

    it('reports up-to-date and rewrites nothing on a second run', () => {
      expect(inject().status).toBe(0);

      const result = inject();

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('(up-to-date)');
      expect(result.stdout).not.toContain('+ skills/rt-skill/SKILL.md');
      expect(readFileSync(installed.skill(), 'utf-8')).toBe(SKILL_BODY);
    });

    // The computed hashes have to be real hashes: a local edit must be caught
    // exactly as it would be against a built manifest.
    it('blocks on a locally edited copy and demands --force', () => {
      expect(inject().status).toBe(0);
      writeFileSync(installed.skill(), '# Edited by hand\n', 'utf-8');

      const result = inject();

      expect(result.status).toBe(2);
      // Diagnostics share stdout with the transcript unless `--json` diverts
      // them; only the force-overwrite list goes straight to stderr.
      expect(result.stdout).toContain('Re-run with --force');
      expect(readFileSync(installed.skill(), 'utf-8')).toBe(
        '# Edited by hand\n',
      );
    });

    it('restores the source bytes when --force is granted', () => {
      expect(inject().status).toBe(0);
      writeFileSync(installed.skill(), '# Edited by hand\n', 'utf-8');

      const result = inject('--force');

      expect(result.status).toBe(0);
      expect(result.stderr).toContain(SKILL_REL);
      expect(readFileSync(installed.skill(), 'utf-8')).toBe(SKILL_BODY);
    });

    // The property a built manifest cannot have: the directory IS the source,
    // so editing it changes the verdict on the very next run, with no rebuild.
    it('tracks a source edit immediately, with no build step in between', () => {
      expect(inject().status).toBe(0);
      const revised = '# RT Skill, revised\n';
      writeFileSync(join(assetRoot, SKILL_REL), revised, 'utf-8');

      expect(inject().status).toBe(2);
      expect(inject('--force').status).toBe(0);
      expect(readFileSync(installed.skill(), 'utf-8')).toBe(revised);
      // Converging matters as much as copying: the run after the force must
      // settle to up-to-date, which only holds if the recomputed hash of the
      // revised source equals the hash of what was just written.
      expect(inject().stdout).toContain('(up-to-date)');
    });

    // Rules reach codex as marker blocks inside a shared document, judged by
    // body hash rather than file hash — the other half of the comparison.
    it('merges a rule into AGENTS.md as a block, idempotently', () => {
      const codex = () =>
        run('--agent=codex', '--scope=project', '--asset-path=agents');

      expect(codex().status).toBe(0);
      const afterFirst = readFileSync(installed.agentsMd(), 'utf-8');
      expect(afterFirst).toContain(
        `AGENTS-ASSETS-SYNC:START:${PACKAGE}:${RULE_REL}`,
      );
      expect(afterFirst).toContain(RULE_BODY);
      expect(readFileSync(installed.codexSkill(), 'utf-8')).toBe(SKILL_BODY);

      const second = codex();

      expect(second.status).toBe(0);
      expect(second.stdout).toContain('(up-to-date)');
      expect(readFileSync(installed.agentsMd(), 'utf-8')).toBe(afterFirst);
    });

    // Content this tool does not own must survive a write into the shared file.
    it('leaves foreign content in AGENTS.md byte for byte', () => {
      const foreign = '# Hand-written\n\nkeep me\n';
      writeFileSync(installed.agentsMd(), foreign, 'utf-8');

      expect(
        run('--agent=codex', '--scope=project', '--asset-path=agents').status,
      ).toBe(0);

      expect(readFileSync(installed.agentsMd(), 'utf-8')).toContain(foreign);
    });
  },
);
