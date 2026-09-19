import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PROJECT_ANCHORS,
  PROJECT_ROOT_MARKERS,
  findMarkerRoot,
  findProjectRoot,
  isValidScope,
  resolveProjectRoot,
} from '../index.js';

// `fakeHome` stands in for the home directory only inside the test that sets
// it; every other test keeps the real one.
let fakeHome: string | null = null;
vi.mock('node:os', async (importOriginal) => {
  const os = await importOriginal<typeof import('node:os')>();
  return { ...os, homedir: () => fakeHome ?? os.homedir() };
});

describe('core/scope — shared project anchor', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-scope-'));
  });

  afterEach(async () => {
    fakeHome = null;
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

      expect(findProjectRoot(deep)).toBe(tmp);
    },
  );

  it('covers every entry of PROJECT_ROOT_MARKERS as a table row', () => {
    expect([...PROJECT_ROOT_MARKERS]).toEqual([
      '.git',
      'pnpm-workspace.yaml',
      'pnpm-lock.yaml',
      'yarn.lock',
      'package-lock.json',
      'npm-shrinkwrap.json',
      'bun.lock',
      'bun.lockb',
    ]);
  });

  it.each([
    '.git',
    'pnpm-workspace.yaml',
    'pnpm-lock.yaml',
    'yarn.lock',
    'package-lock.json',
    'npm-shrinkwrap.json',
    'bun.lock',
    'bun.lockb',
  ])('lets root marker %s outrank a nearer agent anchor', async (marker) => {
    // A tool may drop `.claude` into any workspace member; the lockfile or
    // repository root above it is still the project.
    await writeFile(join(tmp, marker), '', 'utf-8');
    const member = join(tmp, 'packages', 'a');
    await mkdir(join(member, '.claude'), { recursive: true });

    expect(findProjectRoot(member)).toBe(tmp);
  });

  it('returns the nearest root marker when several ancestors own one', async () => {
    await writeFile(join(tmp, '.git'), '', 'utf-8');
    const nested = join(tmp, 'examples', 'standalone');
    await mkdir(join(nested, 'src'), { recursive: true });
    await writeFile(join(nested, 'package-lock.json'), '', 'utf-8');

    expect(findProjectRoot(join(nested, 'src'))).toBe(nested);
  });

  it('ignores a root marker owned by the home directory or above it', async () => {
    // A dotfiles repository puts `.git` in the home directory; it claims no
    // project underneath.
    fakeHome = join(tmp, 'home');
    await mkdir(join(fakeHome, '.git'), { recursive: true });
    await writeFile(join(tmp, 'yarn.lock'), '', 'utf-8');
    const project = join(fakeHome, 'work', 'proj');
    await mkdir(join(project, 'src'), { recursive: true });
    await writeFile(join(project, 'AGENTS.md'), '', 'utf-8');

    expect(findMarkerRoot(join(project, 'src'))).toBeNull();
    expect(findProjectRoot(join(project, 'src'))).toBe(project);
  });

  it('recognises an anchor that is a directory', async () => {
    await mkdir(join(tmp, '.claude'), { recursive: true });
    const deep = join(tmp, 'packages', 'a', 'src');
    await mkdir(deep, { recursive: true });

    expect(findProjectRoot(deep)).toBe(tmp);
    expect(findProjectRoot(tmp)).toBe(tmp); // self counts first
  });

  it('returns the deepest ancestor when several own an anchor', async () => {
    await mkdir(join(tmp, '.claude'), { recursive: true });
    await mkdir(join(tmp, 'packages', 'a', '.codex'), { recursive: true });
    const deep = join(tmp, 'packages', 'a', 'src');
    await mkdir(deep, { recursive: true });

    expect(findProjectRoot(deep)).toBe(join(tmp, 'packages', 'a'));
  });

  it('does not stop at a level that owns no anchor', async () => {
    const nothing = join(tmp, 'nothing');
    await mkdir(nothing, { recursive: true });
    // An ancestor above tmp may legitimately own an anchor, so the only
    // assertion available is that the walk did not stop inside tmp.
    const result = findProjectRoot(nothing);
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
