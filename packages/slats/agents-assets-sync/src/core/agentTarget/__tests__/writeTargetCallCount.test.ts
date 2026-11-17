import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveAgentTarget } from '../agentTarget.js';
import { assertWriteTargetsContained } from '../utils/assertWriteTargetsContained.js';

// Wrap, do not replace: every call still reaches the real file system, and the
// spies only count what the write check asks of it.
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof fsPromises>();
  return {
    ...actual,
    lstat: vi.fn(actual.lstat),
    readdir: vi.fn(actual.readdir),
    realpath: vi.fn(actual.realpath),
  };
});

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

async function countCalls(dstPaths: readonly string[]) {
  vi.mocked(fsPromises.lstat).mockClear();
  vi.mocked(fsPromises.readdir).mockClear();
  vi.mocked(fsPromises.realpath).mockClear();
  await assertWriteTargetsContained({
    agentTarget: resolveAgentTarget('claude', 'project', root),
    dstPaths,
    resolved: new Map(),
  });
  return {
    realpath: vi.mocked(fsPromises.realpath).mock.calls.length,
    lstat: vi.mocked(fsPromises.lstat).mock.calls.length,
    readdir: vi.mocked(fsPromises.readdir).mock.calls.length,
  };
}

describe('core/agentTarget — write check cost on a 40-file skill tree', () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'slats-call-count-'));
    writeFileSync(join(root, 'AGENTS.md'), '', 'utf-8');
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  // Project root once; `.claude`, `.claude/skills` and the first skill fail
  // once each; every later directory derives from a cached missing ancestor;
  // no file is looked at because none can exist yet.
  it('fresh install: 4 realpath, 3 lstat, 0 readdir', async () => {
    expect(await countCalls(destinationFiles())).toEqual({
      realpath: 4,
      lstat: 3,
      readdir: 0,
    });
  });

  // Project root and each of the 12 directories once; the 8 directories that
  // receive several files are listed once each, and the 4 that receive only
  // SKILL.md use one lstat each.
  it('overwrite: 13 realpath, 4 lstat, 8 readdir', async () => {
    const files = destinationFiles();
    for (const file of files) {
      mkdirSync(join(file, '..'), { recursive: true });
      writeFileSync(file, 'installed\n', 'utf-8');
    }
    expect(await countCalls(files)).toEqual({
      realpath: 13,
      lstat: 4,
      readdir: 8,
    });
  });
});
