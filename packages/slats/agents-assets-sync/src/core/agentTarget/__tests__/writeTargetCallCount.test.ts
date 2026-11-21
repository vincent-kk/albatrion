import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveAgentTarget } from '../agentTarget.js';
import type { AssetKind, OrphanScan, ResolvedLocations } from '../type.js';
import { assertProjectPathsContained } from '../utils/assertProjectPathsContained.js';

// Wrap, do not replace: every call still reaches the real file system, and the
// spies only count what the checks ask of it.
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof fsPromises>();
  return {
    ...actual,
    lstat: vi.fn(actual.lstat),
    readdir: vi.fn(actual.readdir),
    realpath: vi.fn(actual.realpath),
  };
});

const KINDS: ReadonlySet<AssetKind> = new Set(['skills', 'rules', 'commands']);
let root: string;

// 40 files: 4 skills x (SKILL.md + 4 under refs/ + 5 under refs/deep/), in
// the order a manifest lists them.
function destinationFiles(): string[] {
  const paths: string[] = [];
  for (let s = 0; s < 4; s++) {
    const base = join(root, '.claude/skills', `sk${s}`);
    paths.push(join(base, 'SKILL.md'));
    for (let i = 0; i < 5; i++) paths.push(join(base, `refs/deep/d${i}.md`));
    for (let i = 0; i < 4; i++) paths.push(join(base, `refs/r${i}.md`));
  }
  return paths;
}

function namespaceScans(): OrphanScan[] {
  return [0, 1, 2, 3].map((s) => ({
    kind: 'directory',
    scanRoot: join(root, '.claude/skills', `sk${s}`),
    relPathPrefix: `skills/sk${s}/`,
  }));
}

function takeCounts() {
  const counts = {
    realpath: vi.mocked(fsPromises.realpath).mock.calls.length,
    lstat: vi.mocked(fsPromises.lstat).mock.calls.length,
    readdir: vi.mocked(fsPromises.readdir).mock.calls.length,
  };
  vi.mocked(fsPromises.realpath).mockClear();
  vi.mocked(fsPromises.lstat).mockClear();
  vi.mocked(fsPromises.readdir).mockClear();
  return counts;
}

// The sequence every renderer runs: the roots check, then the write check,
// sharing one per-run cache.
async function countBothChecks() {
  const agentTarget = resolveAgentTarget('claude', 'project', root);
  const resolved: ResolvedLocations = new Map();
  takeCounts();
  await assertProjectPathsContained({
    agentTarget,
    assetKinds: KINDS,
    orphanScans: namespaceScans(),
    resolved,
  });
  const roots = takeCounts();
  await assertProjectPathsContained({
    agentTarget,
    dstPaths: destinationFiles(),
    resolved,
  });
  return { roots, writes: takeCounts() };
}

describe('core/agentTarget — containment cost on a 40-file skill tree', () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'slats-call-count-'));
    writeFileSync(join(root, 'AGENTS.md'), '', 'utf-8');
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  // Roots: the project root resolves, `.claude/skills` and `.claude` fail
  // once each, and the other roots and namespaces derive from them. Writes:
  // everything sits below a missing directory, so nothing is read.
  it('fresh install: the write check makes no file-system call', async () => {
    expect(await countBothChecks()).toEqual({
      roots: { realpath: 3, lstat: 2, readdir: 0 },
      writes: { realpath: 0, lstat: 0, readdir: 0 },
    });
  });

  // Writes: per skill, the namespace, `refs` and `refs/deep` are each listed
  // once; the listings decide every directory and file, so no realpath or
  // lstat is needed (12 reads for 40 files).
  it('overwrite: the write check lists each existing directory once', async () => {
    for (const file of destinationFiles()) {
      mkdirSync(join(file, '..'), { recursive: true });
      writeFileSync(file, 'installed\n', 'utf-8');
    }
    expect(await countBothChecks()).toEqual({
      roots: { realpath: 9, lstat: 2, readdir: 0 },
      writes: { realpath: 0, lstat: 0, readdir: 12 },
    });
  });
});
