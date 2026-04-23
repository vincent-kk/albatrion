import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listConsumers } from '../../src/commands/list.js';
import {
  resolveCwdPackageName,
  resolveTargets,
  type DefaultFlags,
} from '../../src/commands/root.js';
import type { ConsumerPackage } from '../../src/discover.js';

describe('commands/list (subcommand handler)', () => {
  let tmp: string;
  let stdoutWrite: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-cmd-list-'));
    stdoutWrite = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  afterEach(async () => {
    stdoutWrite.mockRestore();
    vi.clearAllMocks();
    await rm(tmp, { recursive: true, force: true });
  });

  it('emits JSON containing discovered consumers', async () => {
    await mkdir(join(tmp, 'packages', 'alpha'), { recursive: true });
    await writeFile(
      join(tmp, 'package.json'),
      JSON.stringify({
        name: '@fixture/root',
        version: '0.0.0',
        workspaces: ['packages/*'],
        private: true,
      }),
    );
    await writeFile(
      join(tmp, 'packages', 'alpha', 'package.json'),
      JSON.stringify({
        name: '@fixture/alpha',
        version: '1.0.0',
        claude: { assetPath: 'docs/claude' },
      }),
    );

    await listConsumers({ cwd: tmp, json: true });
    const emitted = stdoutWrite.mock.calls.map((c) => c[0] as string).join('');
    const parsed = JSON.parse(emitted);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('@fixture/alpha');
    expect(parsed[0].hashesPresent).toBe(false);
  });

  it('prints a table with headers and rows for the discovered set', async () => {
    await writeFile(
      join(tmp, 'package.json'),
      JSON.stringify({
        name: '@fixture/only',
        version: '1.2.3',
        claude: { assetPath: 'docs/claude' },
      }),
    );

    await listConsumers({ cwd: tmp, json: false });
    const emitted = stdoutWrite.mock.calls.map((c) => c[0] as string).join('');
    expect(emitted).toContain('NAME');
    expect(emitted).toContain('VERSION');
    expect(emitted).toContain('@fixture/only');
    expect(emitted).toContain('1.2.3');
  });

  it('emits the no-consumers message when nothing matches', async () => {
    await writeFile(
      join(tmp, 'package.json'),
      JSON.stringify({ name: '@fixture/empty', version: '0.0.0' }),
    );
    await listConsumers({ cwd: tmp, json: false });
    const emitted = stdoutWrite.mock.calls.map((c) => c[0] as string).join('');
    expect(emitted).toContain('No consumer packages');
  });
});

describe('commands/root — resolveCwdPackageName (cwd-first target selection)', () => {
  const mkPkg = (name: string, packageRoot: string): ConsumerPackage => ({
    name,
    version: '1.0.0',
    packageRoot,
    assetRoot: join(packageRoot, 'docs', 'claude'),
    hashesPresent: true,
  });

  it('returns the consumer whose packageRoot equals cwd', () => {
    const a = mkPkg('@fixture/a', '/work/pkg-a');
    const b = mkPkg('@fixture/b', '/work/pkg-b');
    expect(resolveCwdPackageName([a, b], '/work/pkg-a')).toBe('@fixture/a');
  });

  it('returns the consumer whose packageRoot is an ancestor of cwd', () => {
    const a = mkPkg('@fixture/a', '/work/pkg-a');
    const b = mkPkg('@fixture/b', '/work/pkg-b');
    expect(resolveCwdPackageName([a, b], '/work/pkg-b/src/deep')).toBe(
      '@fixture/b',
    );
  });

  it('returns the DEEPEST match when nested packages both own cwd', () => {
    const outer = mkPkg('@fixture/outer', '/work');
    const inner = mkPkg('@fixture/inner', '/work/pkg-a');
    expect(
      resolveCwdPackageName([outer, inner], '/work/pkg-a/src'),
    ).toBe('@fixture/inner');
  });

  it('returns null when cwd is outside every packageRoot', () => {
    const a = mkPkg('@fixture/a', '/work/pkg-a');
    const b = mkPkg('@fixture/b', '/work/pkg-b');
    expect(resolveCwdPackageName([a, b], '/elsewhere')).toBeNull();
  });

  it('does not match a sibling whose packageRoot is a string-prefix but not a path ancestor', () => {
    const a = mkPkg('@fixture/a', '/work/pkg-a');
    // /work/pkg-alpha has /work/pkg-a as a string prefix but NOT as a path ancestor.
    expect(resolveCwdPackageName([a], '/work/pkg-alpha/src')).toBeNull();
  });
});

describe('commands/root — resolveTargets precedence (cwd wins over invokedFromBin)', () => {
  const mkPkg = (name: string, packageRoot: string): ConsumerPackage => ({
    name,
    version: '1.0.0',
    packageRoot,
    assetRoot: join(packageRoot, 'docs', 'claude'),
    hashesPresent: true,
  });
  const emptyFlags: DefaultFlags = {};

  it('selects the cwd-owned consumer even when invokedFromBin points at a different consumer', () => {
    const a = mkPkg('@fixture/a', '/work/pkg-a');
    const b = mkPkg('@fixture/b', '/work/pkg-b');
    const picked = resolveTargets([a, b], emptyFlags, '@fixture/a', '@fixture/b');
    expect(picked).toHaveLength(1);
    expect(picked[0].name).toBe('@fixture/a');
  });

  it('falls back to invokedFromBin when cwd is outside every consumer', () => {
    const a = mkPkg('@fixture/a', '/work/pkg-a');
    const b = mkPkg('@fixture/b', '/work/pkg-b');
    const picked = resolveTargets([a, b], emptyFlags, null, '@fixture/b');
    expect(picked).toHaveLength(1);
    expect(picked[0].name).toBe('@fixture/b');
  });

  it('--package overrides both cwd and invokedFromBin', () => {
    const a = mkPkg('@fixture/a', '/work/pkg-a');
    const b = mkPkg('@fixture/b', '/work/pkg-b');
    const picked = resolveTargets(
      [a, b],
      { package: '@fixture/b' },
      '@fixture/a',
      '@fixture/a',
    );
    expect(picked).toHaveLength(1);
    expect(picked[0].name).toBe('@fixture/b');
  });

  it('--all wins over every other signal', () => {
    const a = mkPkg('@fixture/a', '/work/pkg-a');
    const b = mkPkg('@fixture/b', '/work/pkg-b');
    const picked = resolveTargets([a, b], { all: true }, '@fixture/a', '@fixture/b');
    expect(picked).toHaveLength(2);
  });
});
