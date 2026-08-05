import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  PROJECT_ANCHORS,
  findNearestAnchorAncestor,
  isValidScope,
  resolveProjectRoot,
} from '../../src/core/scope/index.js';

describe('core/scope — shared project anchor', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-scope-'));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  // The rows are written out rather than spread from PROJECT_ANCHORS so the
  // case count is statically countable; the guard below keeps them in step.
  it('covers every entry of PROJECT_ANCHORS as a table row', () => {
    expect([...PROJECT_ANCHORS]).toEqual([
      '.claude',
      'AGENTS.md',
      '.agents',
      '.codex',
      '.git',
    ]);
  });

  it.each(['.claude', 'AGENTS.md', '.agents', '.codex', '.git'])(
    'recognises %s as a project anchor',
    async (anchor) => {
      // AGENTS.md is a file; .git is a file inside a worktree. Existence is
      // what marks the root, so a file placed at any anchor name counts.
      await writeFile(join(tmp, anchor), '', 'utf-8');
      const deep = join(tmp, 'packages', 'a', 'src');
      await mkdir(deep, { recursive: true });

      expect(findNearestAnchorAncestor(deep)).toBe(tmp);
    },
  );

  it('recognises an anchor that is a directory', async () => {
    await mkdir(join(tmp, '.claude'), { recursive: true });
    const deep = join(tmp, 'packages', 'a', 'src');
    await mkdir(deep, { recursive: true });

    expect(findNearestAnchorAncestor(deep)).toBe(tmp);
    expect(findNearestAnchorAncestor(tmp)).toBe(tmp); // self counts first
  });

  it('returns the deepest ancestor when several own an anchor', async () => {
    await mkdir(join(tmp, '.claude'), { recursive: true });
    await mkdir(join(tmp, 'packages', 'a', '.codex'), { recursive: true });
    const deep = join(tmp, 'packages', 'a', 'src');
    await mkdir(deep, { recursive: true });

    expect(findNearestAnchorAncestor(deep)).toBe(join(tmp, 'packages', 'a'));
  });

  it('does not stop at a level that owns no anchor', async () => {
    const nothing = join(tmp, 'nothing');
    await mkdir(nothing, { recursive: true });
    // An ancestor above tmp may legitimately own an anchor, so the only
    // assertion available is that the walk did not stop inside tmp.
    const result = findNearestAnchorAncestor(nothing);
    if (result !== null) expect(result.startsWith(tmp)).toBe(false);
  });

  it('resolveProjectRoot("project") reports the located ancestor', async () => {
    await mkdir(join(tmp, 'AGENTS.md'), { recursive: true });
    const deep = join(tmp, 'packages', 'a');
    await mkdir(deep, { recursive: true });

    const res = resolveProjectRoot('project', deep);
    expect(res).toEqual({
      scope: 'project',
      projectRoot: tmp,
      autoLocated: true,
    });
  });

  it('resolveProjectRoot("project") falls back to cwd without an anchor', () => {
    const res = resolveProjectRoot('project', '/');
    expect(res.projectRoot).toBe('/');
    expect(res.autoLocated).toBe(false);
  });

  it('resolveProjectRoot("user") is the home directory, never auto-located', () => {
    const res = resolveProjectRoot('user', tmp);
    expect(res).toEqual({
      scope: 'user',
      projectRoot: homedir(),
      autoLocated: false,
    });
  });

  it.each([
    ['user', true],
    ['project', true],
    ['global', false],
    ['', false],
    [undefined, false],
  ] as const)('isValidScope(%s) is %s', (value, expected) => {
    expect(isValidScope(value)).toBe(expected);
  });
});
