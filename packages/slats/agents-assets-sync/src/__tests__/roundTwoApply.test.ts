import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Runs the built bin against temp directories only (never ~/.claude or the repo).
const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const BIN_PATH = join(PACKAGE_ROOT, 'bin/inject-agents-settings.mjs');
const PACKAGE = '@r2-periphery/probe';

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

function setVersion(version: string) {
  writeAt(
    join(packageRoot, 'package.json'),
    JSON.stringify({ name: PACKAGE, version }),
  );
}

const probeFs = () => {
  const dir = mkdtempSync(join(tmpdir(), 'r2p-fs-'));
  writeFileSync(join(dir, 'Case'), 'x');
  const caseInsensitive = existsSync(join(dir, 'CASE'));
  writeFileSync(join(dir, 'é'), 'x');
  const normInsensitive = existsSync(join(dir, 'é'));
  writeFileSync(join(dir, 'Σ'), 'x');
  writeFileSync(join(dir, 'ß'), 'x');
  writeFileSync(join(dir, 'ſ'), 'x');
  const isSigmaInsensitive = existsSync(join(dir, 'ς'));
  const isSharpSInsensitive = existsSync(join(dir, 'SS'));
  const isCapitalSharpSInsensitive = existsSync(join(dir, 'ẞ'));
  const isLongSInsensitive = existsSync(join(dir, 'S'));
  rmSync(dir, { recursive: true, force: true });
  return {
    caseInsensitive,
    normInsensitive,
    isSigmaInsensitive,
    isSharpSInsensitive,
    isCapitalSharpSInsensitive,
    isLongSInsensitive,
  };
};
const FS = probeFs();

const BASE = ['--scope=project', '--asset-path=agents'];

describe('r2-periphery agents-assets-sync probes (temp dirs only)', () => {
  beforeEach(() => {
    outerRoot = mkdtempSync(join(tmpdir(), 'r2p-aas-'));
    projectRoot = join(outerRoot, 'project');
    mkdirSync(join(projectRoot, '.git'), { recursive: true });
    writeFileSync(join(projectRoot, 'AGENTS.md'), '# Project\n', 'utf-8');
    packageRoot = join(projectRoot, 'node_modules', ...PACKAGE.split('/'));
    assetRoot = join(packageRoot, 'agents');
    setVersion('1.0.0');
  });

  afterEach(() => {
    // Restore permissions so cleanup can remove everything.
    const walk = (dir: string) => {
      try {
        chmodSync(dir, 0o755);
        for (const e of readdirSync(dir, { withFileTypes: true }))
          if (e.isDirectory()) walk(join(dir, e.name));
      } catch {
        /* ignore */
      }
    };
    walk(outerRoot);
    rmSync(outerRoot, { recursive: true, force: true });
  });

  it('(round-2 agents-assets-sync 1) a copy that fails with EACCES does not exit 0 and report the file as created', () => {
    writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
    expect(run('--agent=claude', ...BASE).status).toBe(0);
    writeAt(join(assetRoot, 'skills/pp/new.md'), '# new\n');
    const skillDir = join(projectRoot, '.claude/skills/pp');
    chmodSync(skillDir, 0o555);

    const result = run('--agent=claude', ...BASE, '--json');
    const plain = run('--agent=claude', ...BASE, '--force', '--yes');
    chmodSync(skillDir, 0o755);
    const doc = JSON.parse(result.stdout);
    expect(result.status).toBe(plain.status);
    const created: string[] = doc.units[0].report.created;
    const written = existsSync(join(skillDir, 'new.md'));
    expect({
      written,
      status: result.status,
      exitCode: doc.exitCode,
      reportedCreated: created.includes('skills/pp/new.md'),
    }).toEqual({
      written: false,
      status: 1,
      exitCode: 1,
      reportedCreated: false,
    });
  });

  it('(round-2 agents-assets-sync 1) an orphan whose unlink fails with EACCES is not reported as deleted with exit 0', () => {
    writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
    writeAt(join(assetRoot, 'skills/pp/old.md'), '# old\n');
    expect(run('--agent=claude', ...BASE).status).toBe(0);
    rmSync(join(assetRoot, 'skills/pp/old.md'));
    const skillDir = join(projectRoot, '.claude/skills/pp');
    chmodSync(skillDir, 0o555);
    const result = run('--agent=claude', ...BASE, '--force', '--yes', '--json');
    const plain = run('--agent=claude', ...BASE, '--force', '--yes');
    chmodSync(skillDir, 0o755);
    const doc = JSON.parse(result.stdout);
    expect(result.status).toBe(plain.status);
    expect({
      stillThere: existsSync(join(skillDir, 'old.md')),
      exitCode: doc.exitCode,
      reportedDeleted: doc.units[0].report.deleted.includes('skills/pp/old.md'),
    }).toEqual({ stillThere: true, exitCode: 1, reportedDeleted: false });
  });

  it.skipIf(!FS.caseInsensitive)(
    '(round-2 agents-assets-sync 2) a case-only rename between versions keeps the renamed file after --force',
    () => {
      writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
      writeAt(join(assetRoot, 'skills/pp/README.md'), '# readme\n');
      expect(run('--agent=claude', ...BASE).status).toBe(0);
      const baseline = run('--agent=claude', ...BASE, '--force', '--yes');
      const beforeNames = readdirSync(join(projectRoot, '.claude/skills/pp'))
        .map((name) => name.normalize('NFC').toLowerCase())
        .sort();
      // v2 renames README.md -> Readme.md (case only), same bytes.
      rmSync(join(assetRoot, 'skills/pp/README.md'));
      writeAt(join(assetRoot, 'skills/pp/Readme.md'), '# readme\n');
      setVersion('2.0.0');
      const plain = run('--agent=claude', ...BASE);
      const forced = run('--agent=claude', ...BASE, '--force', '--yes');
      const names = readdirSync(join(projectRoot, '.claude/skills/pp')).sort();
      expect(plain.status).toBe(baseline.status);
      expect(forced.status).toBe(baseline.status);
      expect(
        names.map((name) => name.normalize('NFC').toLowerCase()).sort(),
      ).toEqual(beforeNames);
    },
  );

  it.skipIf(!FS.normInsensitive)(
    '(round-2 agents-assets-sync 2) an NFD -> NFC file-name change between versions keeps the file after --force',
    () => {
      const nfd = 'café.md';
      const nfc = 'café.md';
      writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
      writeAt(join(assetRoot, 'skills/pp', nfd), '# cafe\n');
      expect(run('--agent=claude', ...BASE).status).toBe(0);
      const baseline = run('--agent=claude', ...BASE, '--force', '--yes');
      const beforeNames = readdirSync(join(projectRoot, '.claude/skills/pp'))
        .map((name) => name.normalize('NFC'))
        .sort();
      rmSync(join(assetRoot, 'skills/pp', nfd));
      writeAt(join(assetRoot, 'skills/pp', nfc), '# cafe\n');
      setVersion('2.0.0');
      const forced = run('--agent=claude', ...BASE, '--force', '--yes');
      const names = readdirSync(join(projectRoot, '.claude/skills/pp'));
      expect(forced.status).toBe(baseline.status);
      expect(names.map((name) => name.normalize('NFC')).sort()).toEqual(
        beforeNames,
      );
    },
  );

  describe.each([
    ['isSigmaInsensitive', 'Σ.md', 'ς.md'],
    ['isSharpSInsensitive', 'ß.md', 'SS.md'],
    ['isCapitalSharpSInsensitive', 'ẞ.md', 'ß.md'],
    ['isLongSInsensitive', 'ſ.md', 'S.md'],
  ] as const)('Unicode aliases %s', (flag, previousName, currentName) => {
    it.skipIf(!FS[flag])(
      '(round-2 agents-assets-sync 2) preserves Unicode case aliases like an unchanged file (requires matching filesystem case folding)',
      () => {
        writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
        writeAt(join(assetRoot, 'skills/pp', previousName), '# unicode\n');
        const initial = run('--agent=claude', ...BASE);
        const installed = join(projectRoot, '.claude/skills/pp');
        const baseline = {
          status: initial.status,
          body: readFileSync(join(installed, previousName), 'utf8'),
        };
        rmSync(join(assetRoot, 'skills/pp', previousName));
        writeAt(join(assetRoot, 'skills/pp', currentName), '# unicode\n');
        setVersion('2.0.0');
        const plain = run('--agent=claude', ...BASE);
        const forced = run('--agent=claude', ...BASE, '--force', '--yes');
        const target = join(installed, currentName);
        expect({
          status: forced.status,
          body: existsSync(target) ? readFileSync(target, 'utf8') : null,
        }).toEqual(baseline);
        expect(plain.status).toBe(baseline.status);
      },
    );
  });

  it('(round-2 agents-assets-sync 3) a blocked multi-agent run exits with the same code in plain and --json', () => {
    writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
    writeAt(join(assetRoot, 'rules/pp-rule.md'), '# rule\n');
    expect(run('--agent=claude,codex', ...BASE).status).toBe(0);
    writeAt(join(projectRoot, '.claude/skills/pp/SKILL.md'), '# edited\n');
    const plain = run('--agent=claude,codex', ...BASE);
    const json = run('--agent=claude,codex', ...BASE, '--json');
    expect({ plain: plain.status, json: json.status }).toEqual({
      plain: json.status,
      json: json.status,
    });
    expect(plain.status).toBe(2);
  });

  it('(round-2 agents-assets-sync 3) prioritizes execution errors over blocked units in either order and output', () => {
    writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
    expect(run('--agent=claude,codex', ...BASE).status).toBe(0);
    const outside = join(outerRoot, 'outside');
    mkdirSync(outside);
    const claude = join(projectRoot, '.claude/skills/pp');
    rmSync(claude, { recursive: true });
    symlinkSync(outside, claude, 'dir');
    writeAt(join(projectRoot, '.agents/skills/pp/SKILL.md'), '# edited\n');
    for (const agents of ['claude,codex', 'codex,claude']) {
      const plain = run(`--agent=${agents}`, ...BASE);
      const json = run(`--agent=${agents}`, ...BASE, '--json');
      expect(json.status).toBe(plain.status);
      expect(plain.status).toBe(1);
    }
  });

  it.each([PACKAGE, '@r2-periphery'])(
    '(round-2 agents-assets-sync 5) resolves BOM and ordinary metadata equivalently via %s',
    (target) => {
      writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
      const ordinary = run(
        '--package',
        target,
        '--agent=claude',
        ...BASE,
        '--dry-run',
        '--json',
      );
      writeAt(
        join(packageRoot, 'package.json'),
        '\uFEFF' + JSON.stringify({ name: PACKAGE, version: '1.0.0' }),
      );
      const bom = run(
        '--package',
        target,
        '--agent=claude',
        ...BASE,
        '--dry-run',
        '--json',
      );
      expect(bom.status).toBe(ordinary.status);
      expect(JSON.parse(bom.stdout)).toEqual(JSON.parse(ordinary.stdout));
    },
  );
  it.each([PACKAGE, '@r2-periphery'])(
    '(round-2 agents-assets-sync 5) resolves BOM through an encapsulated package entry equivalently via %s',
    (target) => {
      writeAt(join(assetRoot, 'skills/pp/SKILL.md'), '# skill\n');
      writeAt(join(packageRoot, 'index.js'), 'export {};\n');
      const metadata = {
        name: PACKAGE,
        version: '1.0.0',
        exports: { '.': './index.js' },
      };
      writeAt(join(packageRoot, 'package.json'), JSON.stringify(metadata));
      const ordinary = run(
        '--package',
        target,
        '--agent=claude',
        ...BASE,
        '--dry-run',
        '--json',
      );
      writeAt(
        join(packageRoot, 'package.json'),
        '\uFEFF' + JSON.stringify(metadata),
      );
      const bom = run(
        '--package',
        target,
        '--agent=claude',
        ...BASE,
        '--dry-run',
        '--json',
      );
      expect(bom.status).toBe(ordinary.status);
      expect(JSON.parse(bom.stdout)).toEqual(JSON.parse(ordinary.stdout));
    },
  );
});
