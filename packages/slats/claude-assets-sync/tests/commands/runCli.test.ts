import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { DefaultFlags } from '../../src/commands/runCli/index.js';
import { resolveCwdPackageName } from '../../src/commands/runCli/utils/resolveCwdPackageName.js';
import { resolveTargets } from '../../src/commands/runCli/utils/resolveTargets.js';
import type { ConsumerPackage } from '../../src/discover/index.js';

describe('commands/runCli — resolveCwdPackageName (cwd-first target selection)', () => {
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
    expect(resolveCwdPackageName([outer, inner], '/work/pkg-a/src')).toBe(
      '@fixture/inner',
    );
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

describe('commands/runCli — resolveTargets precedence (cwd wins over invokedFromBin)', () => {
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
